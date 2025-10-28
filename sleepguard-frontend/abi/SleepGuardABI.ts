
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const SleepGuardABI = {
  "abi": [
    {
      "inputs": [],
      "name": "DataAlreadySubmittedForDate",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidIndex",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProfileAlreadyExists",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ProfileNotCreated",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "Unauthorized",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "join",
          "type": "bool"
        }
      ],
      "name": "LeaderboardParticipationUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "aggregation",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "anonymousReport",
          "type": "bool"
        }
      ],
      "name": "PrivacySettingsUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ProfileCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "date",
          "type": "uint256"
        }
      ],
      "name": "SleepDataSubmitted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "_allowAggregation",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "_allowAnonymousReport",
          "type": "bool"
        }
      ],
      "name": "createProfile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGlobalAverageStats",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "avgDuration",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "avgDeepSleep",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "avgScore",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "participants",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserAggregatedStats",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "sumDuration",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "sumDeepSleep",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "sumScore",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "totalEntries",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserEntriesCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "count",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "getUserSleepData",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "date",
          "type": "uint256"
        },
        {
          "internalType": "euint16",
          "name": "bedtime",
          "type": "bytes32"
        },
        {
          "internalType": "euint16",
          "name": "wakeTime",
          "type": "bytes32"
        },
        {
          "internalType": "euint16",
          "name": "duration",
          "type": "bytes32"
        },
        {
          "internalType": "euint8",
          "name": "deepSleepRatio",
          "type": "bytes32"
        },
        {
          "internalType": "euint8",
          "name": "wakeCount",
          "type": "bytes32"
        },
        {
          "internalType": "euint8",
          "name": "sleepScore",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "hasProfile",
      "outputs": [
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "profiles",
      "outputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "allowAggregation",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "allowAnonymousReport",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "joinLeaderboard",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "totalEntries",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_date",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint16",
          "name": "_bedtime",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint16",
          "name": "_wakeTime",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint16",
          "name": "_duration",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint8",
          "name": "_deepSleepRatio",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint8",
          "name": "_wakeCount",
          "type": "bytes32"
        },
        {
          "internalType": "externalEuint8",
          "name": "_sleepScore",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "_inputProof",
          "type": "bytes"
        }
      ],
      "name": "submitSleepData",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalParticipants",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "_join",
          "type": "bool"
        }
      ],
      "name": "updateLeaderboardParticipation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "_aggregation",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "_anonymous",
          "type": "bool"
        }
      ],
      "name": "updatePrivacySettings",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

