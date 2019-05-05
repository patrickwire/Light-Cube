// Copyright (c) Sandeep Mistry. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Import libraries (BLEPeripheral depends on SPI)
#include <SPI.h>
#include <BLEPeripheral.h>

// define pins (varies per shield/board)
#define BLE_REQ 10
#define BLE_RDY 2
#define BLE_RST 9

// LED and button pin
#define LED_R_PIN 1
#define LED_G_PIN 2
#define LED_B_PIN 3
#define SENSOR_PIN 4

// create peripheral instance, see pinouts above
BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);

// create service
BLEService ledService = BLEService("19b10010e8f2537e4f6cd104768a1214");

// create switch and button characteristic
BLECharCharacteristic colorRCharacteristic = BLECharCharacteristic("19b10011e8f2537e4f6cd104768a1214", BLERead | BLEWrite);
BLECharCharacteristic colorGCharacteristic = BLECharCharacteristic("19b10012e8f2537e4f6cd104768a1214", BLERead | BLEWrite);
BLECharCharacteristic colorBCharacteristic = BLECharCharacteristic("19b10013e8f2537e4f6cd104768a1214", BLERead | BLEWrite);

BLEIntCharacteristic lightCharacteristic = BLEIntCharacteristic("19b10020e8f2537e4f6cd104768a1214", BLERead | BLENotify);

int counter = 0;

void setup()
{
  Serial.begin(115200);
#if defined(__AVR_ATmega32U4__)
  delay(5000); //5 seconds delay for enabling to see the start up comments on the serial board
#endif

  // set LED pin to output mode, button pin to input mode
  pinMode(LED_R_PIN, OUTPUT);
  pinMode(LED_G_PIN, OUTPUT);
  pinMode(LED_B_PIN, OUTPUT);
  pinMode(SENSOR_PIN, INPUT);

  // set advertised local name and service UUID
  blePeripheral.setLocalName("LIGHT CUBE");
  blePeripheral.setDeviceName("LIGHT CUBE");
  blePeripheral.setAdvertisedServiceUuid(ledService.uuid());

  // add service and characteristics
  blePeripheral.addAttribute(ledService);
  blePeripheral.addAttribute(colorRCharacteristic);
  blePeripheral.addAttribute(colorGCharacteristic);
  blePeripheral.addAttribute(colorBCharacteristic);
  blePeripheral.addAttribute(lightCharacteristic);

  // begin initialization
  blePeripheral.begin();

  Serial.println(F("BLE LED Switch Peripheral"));
}

void loop()
{
  // poll peripheral
  blePeripheral.poll();

  analogWrite(LED_R_PIN, colorRCharacteristic.value());
  analogWrite(LED_G_PIN, colorGCharacteristic.value());
  analogWrite(LED_B_PIN, colorBCharacteristic.value());
 if(counter>1000){
    int sensorValue = analogRead(SENSOR_PIN); // read the value from the sensor 
  Serial.println(sensorValue);             //prints the values coming from the sensor on the screen
  lightCharacteristic.setValue(sensorValue);
  counter=0;
 }
  counter++;
}
