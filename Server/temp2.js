const { model } = require("mongoose")

const zones = [{
  "id": "61af9c371e873cc0791e37a2",
  "station1": "61af9af2fcfc3300a31688e6",
  "station2": "61b87717bb96432b6a748c81",
  "employeeId": "614c314dbca9f29e568196c6",
  "tagId": "f3:7a:4c:4d:f1:6a",
  "name": "ZONE1"
},{
  "id": "61af9cbe1e873cc0791e37a3",
  "station1": "61af9b3dfcfc3300a31688e7",
  "station2": "61af9b67fcfc3300a31688e8",
  "employeeId": "614c32a7bca9f29e568196c8",
  "tagId": "e2:24:f4:21:f6:f5",
  "name": "ZONE2"
},{
  "id": "61b87f38297390c46e32bf43",
  "station1": "61af9b73fcfc3300a31688e9",
  "station2": "61b876bfbb96432b6a748c7c",
  "employeeId": "61b881b6297390c46e32bf4c",
  "tagId": "e2:3e:a9:07:1d:e0",
  "name": "ZONE3"
},{
  "id": "61b87f5c297390c46e32bf44",
  "station1": "61b876cbbb96432b6a748c7d",
  "station2": "61b876dcbb96432b6a748c7e",
  "employeeId": "61b879c6bb96432b6a748c84",
  "tagId": "f9:43:dc:76:87:40",
  "name": "ZONE4"
},{
  "id": "61b87fb3297390c46e32bf45",
  "station1": "61b876f1bb96432b6a748c7f",
  "station2": "61b87709bb96432b6a748c80",
  "employeeId": "61b879c6bb96432b6a748c84",
  "tagId": "e2:85:4d:55:36:12",
  "name": "ZONE5"
},{
  "id": "61b87fcb297390c46e32bf46",
  "station1": "61b87735bb96432b6a748c82",
  "station2": "61b879b8bb96432b6a748c83",
  "employeeId": "61b879c6bb96432b6a748c84",
  "tagId": "ff:7b:dc:aa:7a:11",
  "name": "ZONE6"
},{
  "id": "61b87fea297390c46e32bf47",
  "station1": "61b879c6bb96432b6a748c84",
  "station2": "61b87a4ebb96432b6a748c85",
  "employeeId": "61b879c6bb96432b6a748c84",
  "tagId": "d7:88:8e:03:c2:b3",
  "name": "ZONE7"
},{
  "id": "61b88007297390c46e32bf48",
  "station1": "61b87df8bb96432b6a748c86",
  "station2": "61b87e0ebb96432b6a748c87",
  "employeeId": "61b879c6bb96432b6a748c84",
  "tagId": "dd:07:6f:02:93:cf",
  "name": "ZONE8"
},{
  "id": "61b88028297390c46e32bf49",
  "station1": "61b87e19bb96432b6a748c88",
  "station2": "61b87e27bb96432b6a748c89",
  "employeeId": "61b879c6bb96432b6a748c84",
  "tagId": "eb:d0:6e:a8:55:b8",
  "name": "ZONE9"
}]

module.exports = zones;