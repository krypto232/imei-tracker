const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock device info DB by IMEI prefix (for demo)
const deviceInfoDB = {
  "865225": { brand: "Samsung", model: "Galaxy S21" },
  "359881": { brand: "Apple", model: "iPhone 12" },
  "356938": { brand: "OnePlus", model: "9 Pro" },
  // Add more as needed
};

// Mock stolen devices IMEI list
const stolenDevices = [
  "865225060367536",
  "356938035643809",
  // Add stolen IMEIs here
];

// In-memory devices location store
let devices = [];

// 1. Get device info by IMEI prefix
app.get('/deviceInfo/:imei', (req, res) => {
  const imei = req.params.imei;
  const prefix = imei.substring(0, 6);
  const info = deviceInfoDB[prefix];
  if (!info) {
    return res.status(404).json({ error: "Device info not found for this IMEI" });
  }
  res.json({ imei, ...info });
});

// 2. Check if device is stolen
app.get('/isStolen/:imei', (req, res) => {
  const imei = req.params.imei;
  const stolen = stolenDevices.includes(imei);
  res.json({ imei, stolen });
});

// 3. Update location endpoint
app.post('/updateLocation', (req, res) => {
  const { imei, lat, lng } = req.body;
  if (!imei || !lat || !lng) {
    return res.status(400).json({ error: "IMEI, lat and lng required" });
  }

  const existingDevice = devices.find(d => d.imei === imei);
  if (existingDevice) {
    existingDevice.lastLocation = { lat, lng };
    existingDevice.lastSeen = new Date();
  } else {
    devices.push({ imei, lastLocation: { lat, lng }, lastSeen: new Date() });
  }

  res.json({ message: "Location updated" });
});

// 4. Get device last location
app.get('/device/:imei', (req, res) => {
  const device = devices.find(d => d.imei === req.params.imei);
  if (!device) {
    return res.status(404).json({ error: "Device not found" });
  }
  res.json(device);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
