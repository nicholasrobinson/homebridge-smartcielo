var SmartCielo, Service, Characteristic, HomebridgeAPI;

module.exports = function (homebridge) {
    SmartCielo = require('node-smartcielo');
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    HomebridgeAPI = homebridge;
    homebridge.registerAccessory('homebridge-smartcielo', 'SmartCieloThermostat', Thermostat);
};

function Thermostat(log, config) {
    this.log = log;
    this.name = config.name;
    this.manufacturer = config.manufacturer || 'DefaultManufacturer';
    this.model = config.model || 'DefaultModel';
    this.temperatureDisplayUnits = config.temperatureDisplayUnits || 1;
    this.minTemperature = config.minTemperature || 62;
    this.maxTemperature = config.maxTemperature || 86;
    this.commandDelay = config.commandDelay || 10;
    this.service = new Service.Thermostat(this.name);
    this.hvac = new SmartCielo(config.username, config.password, config.ip,
        commandedState => {
            this.log.debug('Commanded State Change:', JSON.stringify(commandedState));
        },
        roomTemperature => {
            this.log.debug('Updated Room Temperature:', roomTemperature);
            this.log.info('Room temperature updated to ' + roomTemperature + ' °F / ' + convertFahrenheitToCelsius(roomTemperature) + ' °C');
        },
        err => {
            this.log.error(err);
        });
}

Thermostat.prototype.getCurrentHeatingCoolingState = function (cb) {
    if (this.hvac.connectionError) {
        return;
    }
    const mode = getModeHelper(this.hvac.getPower(), this.hvac.getMode());
    this.log.debug('getCurrentHeatingCoolingState', mode);
    const state = convertModeToHeatingCoolingState(mode);
    cb(null, state);
};

Thermostat.prototype.getTargetHeatingCoolingState = function (cb) {
    if (this.hvac.connectionError) {
        return;
    }
    const mode = getModeHelper(this.hvac.getPower(), this.hvac.getMode());
    this.log.debug('getTargetHeatingCoolingState', mode);
    cb(null, convertModeToHeatingCoolingState(mode));
};

Thermostat.prototype.setTargetHeatingCoolingState = function (state, cb) {
    if (this.hvac.connectionError) {
        return;
    }
    const mode = convertHeatingCoolingStateToMode(state);
    this.log.debug('setTargetHeatingCoolingState', mode);
    if (mode == 'off') {
        if (this.hvac.getPower() === 'off') {
            this.log.debug('Skipping Command');
        } else {
            this.log.info('Sending power off');
            this.hvac.sendPowerOff(_ => {
                this.log.debug('Sent Command', 'sendPowerOff');
            }, err => {
                this.log.error('sendPowerOff Error', err);
            });
        }
    } else {
        if (this.hvac.getPower() === 'on' && this.hvac.getMode() === mode) {
            this.log.debug('Skipping Command');
        } else {
            const sendModeHelper = (() => {
                return () => {
                    this.log.info('Setting mode to ' + mode);
                    this.hvac.sendMode(mode, _ => {
                        this.log.debug('Sent Command', 'sendMode', mode);
                    }, err => {
                        this.log.error('sendMode Error', err);
                    });
                }
            })();
            if (this.hvac.getPower() === 'off') {
                this.log.info('Sending power on');
                this.hvac.sendPowerOn(_ => {
                    this.log.debug('Sent Command', 'sendPowerOn');
                    // TODO: Investigate closing the loop and removing hard-coded delay.
                    // Note: Potentially there is a way to poll the power until it is updated before sending mode.
                    setTimeout(() => {
                        sendModeHelper();
                    }, this.commandDelay * 1000);
                }, err => {
                    this.log.error('sendPowerOn Error', err);
                });
            } else {
                sendModeHelper();
            }
        }
    }
    cb();
};

Thermostat.prototype.getCurrentTemperature = function (cb) {
    if (this.hvac.connectionError) {
        return;
    }
    const temperature = this.hvac.getRoomTemperature();
    this.log.debug('getCurrentTemperature', temperature);
    cb(null, convertFahrenheitToCelsius(temperature));
};

Thermostat.prototype.getTargetTemperature = function (cb) {
    if (this.hvac.connectionError) {
        return;
    }
    const temperature = this.hvac.getTemperature();
    this.log.debug('getTargetTemperature', temperature);
    cb(null, convertFahrenheitToCelsius(temperature));
};

Thermostat.prototype.setTargetTemperature = function (temperature, cb) {
    if (this.hvac.connectionError) {
        return;
    }
    const temperatureInFahrenheit = convertCelsiusToFahrenheit(temperature, this.minTemperature, this.maxTemperature);
    this.log.debug('setTargetTemperature', temperatureInFahrenheit);
    if (this.hvac.getTemperature() == temperature) {
        this.log.debug('Skipping Command');
    } else {
        this.log.info('Setting temperature to ' + temperatureInFahrenheit + ' °F / ' + convertFahrenheitToCelsius(temperatureInFahrenheit) + ' °C');
        this.hvac.sendTemperature(temperatureInFahrenheit, _ => {
            this.log.debug('Sent Command', 'sendTemperature', temperatureInFahrenheit);
        }, err => {
            this.log.error('sendTemperature Error', err);
        });
    }
    cb();
};

Thermostat.prototype.getTemperatureDisplayUnits = function (cb) {
    if (this.hvac.connectionError) {
        return;
    }
    this.log.debug('getTemperatureDisplayUnits', this.temperatureDisplayUnits);
    cb(null, this.temperatureDisplayUnits);
};

Thermostat.prototype.setTemperatureDisplayUnits = function (displayUnits, cb) {
    if (this.hvac.connectionError) {
        return;
    }
    this.log.debug('setTemperatureDisplayUnits', displayUnits);
    this.log.info('Setting temperature display units to ' + (displayUnits ? '°F' : '°C'));
    this.temperatureDisplayUnits = displayUnits;
    cb();
};

Thermostat.prototype.getName = function (cb) {
    this.log.debug('getName', this.name);
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

function getModeHelper(power, mode) {
    return power === 'off' ? 'off' : mode;
}

function convertCelsiusToFahrenheit(temperature, minTemperature, maxTemperature) {
    return Math.min(Math.max(Math.round(temperature * 9 / 5 + 32), minTemperature), maxTemperature);
}

function convertFahrenheitToCelsius(temperature) {
    return Math.round((temperature - 32) * 5 / 9);
}

function convertHeatingCoolingStateToMode(state) {
    switch (state) {
        case 1:
            return 'heat';
        case 2:
            return 'cool';
        case 3:
            return 'auto';
        case 0:
        default:
            return 'off';
    }
}

function convertModeToHeatingCoolingState(mode) {
    switch (mode) {
        case 'heat':
            return 1;
        case 'cool':
            return 2;
        case 'auto':
            return 3;
        case 'off':
        default:
            return 0;
    }
}
