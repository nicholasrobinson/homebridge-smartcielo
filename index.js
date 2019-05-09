var Service, Characteristic, HomnebridgeAPI;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    HomnebridgeAPI = homebridge;
    homebridge.registerAccessory("homebridge-dummy-thermostat", "Thermostat", Thermostat);
};

function Thermostat(log, config) {
    this.log = log;

    this.name = config.name;
    this.manufacturer = config.manufacturer || "DefaultManufacturer";
    this.model = config.model || "DefaultModel";

    this.temperatureDisplayUnits = config.temperatureDisplayUnits || 0;

    this.cacheDir = HomnebridgeAPI.user.persistPath();
    this.storage = require('node-persist');
    this.storage.initSync({dir: this.cacheDir, forgiveParseErrors: true});

    this.log(this.name);
    this.service = new Service.Thermostat(this.name);
}

Thermostat.prototype.getCurrentHeatingCoolingState = function(cb) {
    this.currentHeatingCoolingState = this.storage.getItemSync(this.name + '&' + 'CurrentHeatingCoolingState');
    if (this.currentHeatingCoolingState === undefined) {
        this.currentHeatingCoolingState = 0;
        this.storage.setItemSync(this.name + '&' + 'CurrentHeatingCoolingState', 0);
    }
	this.log(this.currentHeatingCoolingState);
    cb(null, this.currentHeatingCoolingState);
};

Thermostat.prototype.getTargetHeatingCoolingState = function(cb) {
    this.targetHeatingCoolingState = this.storage.getItemSync(this.name + '&' + 'TargetHeatingCoolingState');
    if (this.targetHeatingCoolingState === undefined) {
        this.targetHeatingCoolingState = 0;
        this.storage.setItemSync(this.name + '&' + 'TargetHeatingCoolingState', 0);
    }
	this.log(this.targetHeatingCoolingState);
    cb(null, this.targetHeatingCoolingState);
};

Thermostat.prototype.setTargetHeatingCoolingState = function(val, cb) {
	this.log(val);
    this.storage.setItemSync(this.name + '&' + 'TargetHeatingCoolingState', val);
	this.storage.setItemSync(this.name + '&' + 'CurrentHeatingCoolingState', val);
    this.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, val);
    cb();
};

Thermostat.prototype.getCurrentTemperature = function(cb) {
    this.currentTemperature = this.storage.getItemSync(this.name + '&' + 'CurrentTemperature');
    if (this.currentTemperature === undefined) {
        this.currentTemperature = 20;
        this.storage.setItemSync(this.name + '&' + 'CurrentTemperature', 20);
    }
	this.log("Current"+this.currentTemperature);
	cb(null, this.currentTemperature);
};

Thermostat.prototype.getTargetTemperature = function(cb) {
    this.targetTemperature = this.storage.getItemSync(this.name + '&' + 'TargetTemperature');
    if (this.targetTemperature === undefined) {
        this.targetTemperature = 20;
        this.storage.setItemSync(this.name + '&' + 'TargetTemperature', 20);
    }
	this.log("Target"+this.targetTemperature);
	cb(null, this.targetTemperature);
};

Thermostat.prototype.setTargetTemperature = function(val, cb) {
	this.log(val);
    this.storage.setItemSync(this.name + '&' + 'TargetTemperature', val);
	this.storage.setItemSync(this.name + '&' + 'CurrentTemperature', val);
	this.service.setCharacteristic(Characteristic.CurrentTemperature, val);
    cb();
};

Thermostat.prototype.getTemperatureDisplayUnits = function(cb) {
    cb(null, this.temperatureDisplayUnits);
};

Thermostat.prototype.setTemperatureDisplayUnits = function(val, cb) {
	this.log(val);
    this.storage.setItemSync(this.name + '&' + 'TemperatureDisplayUnits', val);
    this.temperatureDisplayUnits = val;
    cb();
};

Thermostat.prototype.getName = function(cb) {
    cb(null, this.name);
};

Thermostat.prototype.getServices = function () {
    this.informationService = new Service.AccessoryInformation();
    this.informationService
        .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
        .setCharacteristic(Characteristic.Model, this.model);

    this.service
        .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
        .on('get', this.getCurrentHeatingCoolingState.bind(this));

    this.service
        .getCharacteristic(Characteristic.TargetHeatingCoolingState)
        .on('get', this.getTargetHeatingCoolingState.bind(this))
        .on('set', this.setTargetHeatingCoolingState.bind(this));

    this.service
        .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getCurrentTemperature.bind(this));

    this.service
        .getCharacteristic(Characteristic.TargetTemperature)
        .on('get', this.getTargetTemperature.bind(this))
        .on('set', this.setTargetTemperature.bind(this));

    this.service
        .getCharacteristic(Characteristic.TemperatureDisplayUnits)
        .on('get', this.getTemperatureDisplayUnits.bind(this))
        .on('set', this.setTemperatureDisplayUnits.bind(this));

    this.service
        .getCharacteristic(Characteristic.Name)
        .on('get', this.getName.bind(this));
		
	return [this.informationService, this.service];
};