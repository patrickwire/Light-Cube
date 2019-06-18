import React, { Component } from "react";
import {
  Text,
  View,
  PermissionsAndroid,
  TouchableHighlight,
  StyleSheet,
  ScrollView
} from "react-native";
import { BleManager, Service, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";
import Base64 from "base64-js";
import { ColorPicker, TriangleColorPicker } from "react-native-color-picker";

const styles = StyleSheet.create({
  container: {

   alignContent:"space-around"
  },
  device: {
    padding: 10
  },
  listItem:{
     
  },
  text:{
    color:"#FFFFFF"
  }

});

export default class BLE extends Component {
  serviceUUID = "19b10010-e8f2-537e-4f6c-d104768a1214";
  redcharacteristicUUID = "19b10011-e8f2-537e-4f6c-d104768a1214";
  greecharacteristicUUID = "19b10012-e8f2-537e-4f6c-d104768a1214";
  bluecharacteristicUUID = "19b10013-e8f2-537e-4f6c-d104768a1214";
  manager: BleManager;
  constructor(props: any) {
    super(props);
    this.manager = new BleManager();
    this.state = { devices: [], connected: false, connectedTo: undefined };
    this.addDeviceToList = this.addDeviceToList.bind(this);
    this.connectDevice = this.connectDevice.bind(this);
    this.changeColor = this.changeColor.bind(this);
  }
  componentWillMount() {
    const subscription = this.manager.onStateChange(state => {
      if (state === "PoweredOn") {
        this.scanAndConnect();
        subscription.remove();
      }
    }, true);
  }

  async scanAndConnect() {
    await this.getPermission();
    this.manager.startDeviceScan(null, null, this.addDeviceToList);
  }

  addDeviceToList(error, device) {
    if (device.name) {
      const l = this.state.devices;
      l.push(device);
      this.setState({ devices: l });
    }
  }

 
  async connectDevice(device: Device) {
    this.manager.stopDeviceScan();
    const d = await device.connect();
    device.onDisconnected(error => {
      this.setState({ connected: false });
    });
    const services = await d.discoverAllServicesAndCharacteristics();

    this.setState({ connected: true, connectDevice: d });
  }
  async changeColor(color) {
    

    this.writeColor(this.redcharacteristicUUID, color.r);
    this.writeColor(this.greecharacteristicUUID, color.g);
    this.writeColor(this.bluecharacteristicUUID, color.b);
  }
  writeColor(characteristic: string, 
      characteristic,
      Base64.fromByteArray([value])
    );
  }

  renderScan() {
    const devices = this.state.devices.map((device: Device) => (
      <TouchableHighlight
        style={styles.device}
        onPress={() => {
          this.connectDevice(device);
        }}
      >
        <Text style={[styles.text]}>{device.name}</Text>
      </TouchableHighlight>
    ));
    return (
      <View style={styles.container}>
        <Text style={[styles.text,{fontSize:30,padding:20}]}> Devices </Text>
       <ScrollView>
       {devices}
       </ScrollView>
      </View>
    );
  }
  disconnect() {
    const device:Device=this.state.connectDevice
    device.cancelConnection()
    this.setState({devices:[],connected:false})
    this.scanAndConnect()
  }

  renderControl() {
    return (
      <View style={styles.container}>
        <Text style={[styles.text,{fontSize:20,flex:1,padding:20}]}>{"Connected with " + this.state.connectDevice.name}</Text>
        <ColorPicker
          onColorSelected={(color: string) => {
            this.changeColor({
              r: parseInt("0x" + color.substring(1, 3)),
              g: parseInt("0x" + color.substring(3, 5)),
              b: parseInt("0x" + color.substring(5, 7))
            });
          }}
          style={{ flex: 1 }}
        />
      <TouchableHighlight style={{ flex: 1 }} onPress={()=>{
        this.disconnect()
      }}>
        <Text  style={[styles.text,{padding:20}]}>disconnect</Text>
      </TouchableHighlight>
      </View>
    );
  }
  render() {
    if (this.state.connected) {
      return this.renderControl();
    } else {
      return this.renderScan();
    }
  }

  async getPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: "Location Permission",
          message:
            "In order to use the bluetooth function " +
            "we need this permission."
        }
      );
    } catch (error) {
      console.warn(error);
      return false;
    }
  }
}
