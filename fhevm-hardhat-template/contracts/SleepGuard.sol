// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint16, euint32, euint64, ebool, externalEuint8, externalEuint16} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SleepGuard - Privacy-Preserving Sleep Data Analysis
/// @notice Encrypted sleep data storage and aggregation using FHEVM
/// @dev All sleep metrics are stored as encrypted values (euintXX types)
contract SleepGuard is SepoliaConfig {
    
    // ========== Data Structures ==========
    
    /// @notice User profile with privacy settings
    struct UserProfile {
        address userAddress;
        uint256 createdAt;
        bool allowAggregation;       // Allow participation in global statistics
        bool allowAnonymousReport;   // Allow anonymous report generation
        bool joinLeaderboard;        // Join anonymous leaderboard
        uint256 totalEntries;        // Number of sleep entries
    }
    
    /// @notice Encrypted sleep entry
    /// @dev All sleep metrics are encrypted except the date (used for indexing)
    struct EncryptedSleepEntry {
        uint256 date;           // Unix timestamp (plaintext for indexing)
        euint16 bedtime;        // Encrypted: bedtime in minutes (0-1439)
        euint16 wakeTime;       // Encrypted: wake time in minutes
        euint16 duration;       // Encrypted: duration * 10 (0.1h precision)
        euint8 deepSleepRatio;  // Encrypted: deep sleep ratio (0-100)
        euint8 wakeCount;       // Encrypted: wake count (0-50)
        euint8 sleepScore;      // Encrypted: sleep score (1-10)
    }
    
    // ========== State Variables ==========
    
    /// @notice Mapping from user address to profile
    mapping(address => UserProfile) public profiles;
    
    /// @notice Mapping from user address to array of sleep entries
    mapping(address => EncryptedSleepEntry[]) private sleepData;
    
    /// @notice Mapping to prevent duplicate submissions for the same date
    mapping(address => mapping(uint256 => bool)) private dateSubmitted;
    
    /// @notice Global aggregated statistics (encrypted)
    euint64 private totalDurationSum;      // Global total duration
    euint64 private totalDeepSleepSum;     // Global total deep sleep
    euint64 private totalScoreSum;         // Global total score
    uint256 public totalParticipants;      // Total number of entries (plaintext)
    
    // ========== Events ==========
    
    event ProfileCreated(address indexed user, uint256 timestamp);
    event SleepDataSubmitted(address indexed user, uint256 date);
    event PrivacySettingsUpdated(address indexed user, bool aggregation, bool anonymousReport);
    event LeaderboardParticipationUpdated(address indexed user, bool join);
    
    // ========== Errors ==========
    
    error ProfileNotCreated();
    error ProfileAlreadyExists();
    error DataAlreadySubmittedForDate();
    error Unauthorized();
    error InvalidIndex();
    
    // ========== Core Functions ==========
    
    /// @notice Create user profile with privacy settings
    /// @param _allowAggregation Allow participation in global statistics
    /// @param _allowAnonymousReport Allow anonymous report generation
    function createProfile(
        bool _allowAggregation,
        bool _allowAnonymousReport
    ) external {
        if (profiles[msg.sender].userAddress != address(0)) {
            revert ProfileAlreadyExists();
        }
        
        profiles[msg.sender] = UserProfile({
            userAddress: msg.sender,
            createdAt: block.timestamp,
            allowAggregation: _allowAggregation,
            allowAnonymousReport: _allowAnonymousReport,
            joinLeaderboard: false,
            totalEntries: 0
        });
        
        emit ProfileCreated(msg.sender, block.timestamp);
    }
    
    /// @notice Submit encrypted sleep data
    /// @param _date Unix timestamp of the sleep date
    /// @param _bedtime Encrypted bedtime in minutes
    /// @param _wakeTime Encrypted wake time in minutes
    /// @param _duration Encrypted duration * 10 (0.1h precision)
    /// @param _deepSleepRatio Encrypted deep sleep ratio (0-100)
    /// @param _wakeCount Encrypted wake count (0-50)
    /// @param _sleepScore Encrypted sleep score (1-10)
    /// @param _inputProof Input proof for encrypted values
    /// @return success True if submission successful
    function submitSleepData(
        uint256 _date,
        externalEuint16 _bedtime,
        externalEuint16 _wakeTime,
        externalEuint16 _duration,
        externalEuint8 _deepSleepRatio,
        externalEuint8 _wakeCount,
        externalEuint8 _sleepScore,
        bytes calldata _inputProof
    ) external returns (bool success) {
        if (profiles[msg.sender].userAddress == address(0)) {
            revert ProfileNotCreated();
        }
        if (dateSubmitted[msg.sender][_date]) {
            revert DataAlreadySubmittedForDate();
        }
        
        // Store encrypted data directly
        EncryptedSleepEntry memory entry;
        entry.date = _date;
        entry.bedtime = FHE.fromExternal(_bedtime, _inputProof);
        entry.wakeTime = FHE.fromExternal(_wakeTime, _inputProof);
        entry.duration = FHE.fromExternal(_duration, _inputProof);
        entry.deepSleepRatio = FHE.fromExternal(_deepSleepRatio, _inputProof);
        entry.wakeCount = FHE.fromExternal(_wakeCount, _inputProof);
        entry.sleepScore = FHE.fromExternal(_sleepScore, _inputProof);
        
        sleepData[msg.sender].push(entry);
        
        // Mark date as submitted
        dateSubmitted[msg.sender][_date] = true;
        profiles[msg.sender].totalEntries++;
        
        // Allow user to access their own data
        // IMPORTANT: Must authorize AFTER pushing to array for Mock FHEVM to track properly
        // Allow user to decrypt their own data
        FHE.allow(entry.bedtime, msg.sender);
        FHE.allow(entry.wakeTime, msg.sender);
        FHE.allow(entry.duration, msg.sender);
        FHE.allow(entry.deepSleepRatio, msg.sender);
        FHE.allow(entry.wakeCount, msg.sender);
        FHE.allow(entry.sleepScore, msg.sender);
        
        // Also allow contract to access for aggregation purposes
        FHE.allowThis(entry.bedtime);
        FHE.allowThis(entry.wakeTime);
        FHE.allowThis(entry.duration);
        FHE.allowThis(entry.deepSleepRatio);
        FHE.allowThis(entry.wakeCount);
        FHE.allowThis(entry.sleepScore);
        
        // Update global statistics if user allows aggregation
        if (profiles[msg.sender].allowAggregation) {
            // Initialize global sums if this is the first entry
            if (totalParticipants == 0) {
                totalDurationSum = FHE.asEuint64(entry.duration);
                totalDeepSleepSum = FHE.asEuint64(entry.deepSleepRatio);
                totalScoreSum = FHE.asEuint64(entry.sleepScore);
            } else {
                totalDurationSum = FHE.add(totalDurationSum, FHE.asEuint64(entry.duration));
                totalDeepSleepSum = FHE.add(totalDeepSleepSum, FHE.asEuint64(entry.deepSleepRatio));
                totalScoreSum = FHE.add(totalScoreSum, FHE.asEuint64(entry.sleepScore));
            }
            totalParticipants++;
            
            // Authorize the caller to decrypt the global sums
            // IMPORTANT: Must call allowThis AND allow for proper authorization
            FHE.allowThis(totalDurationSum);
            FHE.allow(totalDurationSum, msg.sender);
            FHE.allowThis(totalDeepSleepSum);
            FHE.allow(totalDeepSleepSum, msg.sender);
            FHE.allowThis(totalScoreSum);
            FHE.allow(totalScoreSum, msg.sender);
        }
        
        emit SleepDataSubmitted(msg.sender, _date);
        return true;
    }
    
    /// @notice Get user's sleep data at specific index
    /// @param _index Index of the sleep entry
    /// @return date Date of the entry
    /// @return bedtime Encrypted bedtime (euint16)
    /// @return wakeTime Encrypted wake time (euint16)
    /// @return duration Encrypted duration (euint16)
    /// @return deepSleepRatio Encrypted deep sleep ratio (euint8)
    /// @return wakeCount Encrypted wake count (euint8)
    /// @return sleepScore Encrypted sleep score (euint8)
    function getUserSleepData(uint256 _index)
        external
        view
        returns (
            uint256 date,
            euint16 bedtime,
            euint16 wakeTime,
            euint16 duration,
            euint8 deepSleepRatio,
            euint8 wakeCount,
            euint8 sleepScore
        )
    {
        if (_index >= sleepData[msg.sender].length) {
            revert InvalidIndex();
        }
        
        EncryptedSleepEntry storage entry = sleepData[msg.sender][_index];
        
        return (
            entry.date,
            entry.bedtime,
            entry.wakeTime,
            entry.duration,
            entry.deepSleepRatio,
            entry.wakeCount,
            entry.sleepScore
        );
    }
    
    /// @notice Get number of sleep entries for a user
    /// @param _user User address
    /// @return count Number of entries
    function getUserEntriesCount(address _user)
        external
        view
        returns (uint256 count)
    {
        return sleepData[_user].length;
    }
    
    /// @notice Get user's aggregated statistics (encrypted sums)
    /// @param _user User address
    /// @return sumDuration Encrypted sum of durations
    /// @return sumDeepSleep Encrypted sum of deep sleep ratios
    /// @return sumScore Encrypted sum of scores
    /// @return totalEntries Total number of entries (for calculating average on frontend)
    function getUserAggregatedStats(address _user)
        external
        returns (
            euint64 sumDuration,
            euint64 sumDeepSleep,
            euint64 sumScore,
            uint256 totalEntries
        )
    {
        if (msg.sender != _user) {
            revert Unauthorized();
        }
        
        EncryptedSleepEntry[] storage entries = sleepData[_user];
        uint256 count = entries.length;
        
        if (count == 0) {
            return (FHE.asEuint64(0), FHE.asEuint64(0), FHE.asEuint64(0), 0);
        }
        
        euint64 _sumDuration = FHE.asEuint64(0);
        euint64 _sumDeepSleep = FHE.asEuint64(0);
        euint64 _sumScore = FHE.asEuint64(0);
        
        for (uint256 i = 0; i < count; i++) {
            _sumDuration = FHE.add(_sumDuration, FHE.asEuint64(entries[i].duration));
            _sumDeepSleep = FHE.add(_sumDeepSleep, FHE.asEuint64(entries[i].deepSleepRatio));
            _sumScore = FHE.add(_sumScore, FHE.asEuint64(entries[i].sleepScore));
        }
        
        // Allow user to decrypt their aggregated stats
        FHE.allow(_sumDuration, _user);
        FHE.allow(_sumDeepSleep, _user);
        FHE.allow(_sumScore, _user);
        
        return (_sumDuration, _sumDeepSleep, _sumScore, count);
    }
    
    /// @notice Get global average statistics (encrypted sums)
    /// @return avgDuration Encrypted sum of all durations
    /// @return avgDeepSleep Encrypted sum of all deep sleep ratios
    /// @return avgScore Encrypted sum of all scores
    /// @return participants Total number of entries (for calculating average on frontend)
    function getGlobalAverageStats()
        external
        returns (
            euint64 avgDuration,
            euint64 avgDeepSleep,
            euint64 avgScore,
            uint256 participants
        )
    {
        require(totalParticipants > 0, "No global data available");
        
        // Authorize the caller to decrypt the global sums
        FHE.allow(totalDurationSum, msg.sender);
        FHE.allow(totalDeepSleepSum, msg.sender);
        FHE.allow(totalScoreSum, msg.sender);
        
        return (
            totalDurationSum,
            totalDeepSleepSum,
            totalScoreSum,
            totalParticipants
        );
    }
    
    
    /// @notice Update privacy settings
    /// @param _aggregation Allow participation in global statistics
    /// @param _anonymous Allow anonymous report generation
    function updatePrivacySettings(
        bool _aggregation,
        bool _anonymous
    ) external {
        if (profiles[msg.sender].userAddress == address(0)) {
            revert ProfileNotCreated();
        }
        
        profiles[msg.sender].allowAggregation = _aggregation;
        profiles[msg.sender].allowAnonymousReport = _anonymous;
        
        emit PrivacySettingsUpdated(msg.sender, _aggregation, _anonymous);
    }
    
    /// @notice Update leaderboard participation
    /// @param _join Join or leave leaderboard
    function updateLeaderboardParticipation(bool _join) external {
        if (profiles[msg.sender].userAddress == address(0)) {
            revert ProfileNotCreated();
        }
        
        profiles[msg.sender].joinLeaderboard = _join;
        
        emit LeaderboardParticipationUpdated(msg.sender, _join);
    }
    
    /// @notice Check if user has profile
    /// @param _user User address
    /// @return exists True if profile exists
    function hasProfile(address _user) external view returns (bool exists) {
        return profiles[_user].userAddress != address(0);
    }
}

