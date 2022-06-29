// In App.js in a new project

import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera, CameraType } from "expo-camera";
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";

let cdata = {};

function LastScreen(props) {
  const [ready, setReady] = useState(false);
  const [image, setImage] = useState(null);
  const [load, setLoad] = useState(false);
  const [showTrick, setShowTick] = useState(false);

  useEffect(() => {
    setImage(cdata.photo.uri);
    setReady(true);
  }, []);

  const sendData = async () => {
    setLoad(true);
    axios
      .post("http://192.168.18.12:8000/uploading", cdata)
      .then((result) => onUploadData())
      .catch((error) => console.log("error", error));
  };

  const onUploadData = async () => {
    axios
      .post("http://192.168.18.12:8000/cnic", cdata)
      .then((result) => {
        setLoad(false);
        setShowTick(true);
      })
      .catch((error) => {
        console.log("error", error);
        setLoad(false);
        alert("Something went Wrong");
      });
  };

  const _rotate90andFlip = async () => {
    const manipResult = await manipulateAsync(
      image.uri ? image.uri : image,
      [({ rotate: 90 }, { flip: FlipType.Vertical })],
      { compress: 1, format: SaveFormat.PNG }
    );
    setImage(manipResult);
  };

  const _renderImage = () => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: image.uri ? image.uri : image }}
        style={styles.image}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.containerSimple}>
      <StatusBar animated={true} backgroundColor="black" />
      <View style={styles.headerViewLast}>
        <Ionicons
          onPress={() => props.navigation.goBack()}
          name="arrow-back"
          size={32}
          color="black"
          style={styles.backIcon}
        />
        <Text style={styles.titleText}>Jalal Ahmed</Text>
        {/* <Text style={{ fontSize: 12, color: "grey", fontWeight: "200" }}>
          Looking to Invest in Golf Floras
        </Text> */}
        <Ionicons name="menu" size={32} color="black" style={styles.menuIcon} />
      </View>

      {!load && !showTrick && (
        <View style={styles.overlayFlex}>
          <Text style={styles.overlayText}>
            {cdata.qr == "Passport"
              ? `Upload ${cdata.qr} Size Photo`
              : `Upload CNIC ${cdata.qr}`}
          </Text>
        </View>
      )}

      {load && !showTrick ? (
        <>
          <ActivityIndicator size={60} color="#1390D7" />
          <Text style={styles.loadTitle}>
            {" "}
            {cdata.qr == "Passport"
              ? `Passport Size Photo`
              : `CNIC ${cdata.qr}`}
          </Text>
          <Text style={styles.loadDescription}>Uploading Document</Text>
        </>
      ) : !load && showTrick ? (
        <>
          <Ionicons name="checkmark-circle" color="green" size={80} />
          <Text style={styles.loadTitle}>Success</Text>
          <Text style={styles.loadDescription}>
            {cdata.qr == "Passport"
              ? `Passport Size Photo - Upload Complete`
              : `CNIC ${cdata.qr} - Upload Complete`}
          </Text>
          <TouchableOpacity
            onPress={() => props.navigation.popToTop()}
            style={styles.uploadDocButton}
          >
            <Text style={styles.uploadText}>Upload Next Doc</Text>
          </TouchableOpacity>
        </>
      ) : (
        ready && image && _renderImage()
      )}

      {!showTrick && (
        <View style={styles.bottomNav}>
          {/* <Button title="Rotate and Flip" onPress={_rotate90andFlip} /> */}
          <Text style={styles.cancelText}>Cancel</Text>
          <Svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <Path
              d="M0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z"
              fill="#3A3F47"
            />
            <Path
              d="M17.9995 18H14.2502"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <Path
              d="M18.0002 14.25V30.0001H33.7502"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <Path
              d="M30.0001 27.0001V18H20.9994"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <Path
              d="M30.0002 33.7501V30.0001"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </Svg>
          <Text
            style={[
              styles.UploadButtonText,
              {
                color: load ? "lightgrey" : "black",
              },
            ]}
            onPress={load ? null : sendData}
          >
            Upload
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function HomeScreen(props) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      setScanned(false);
      setHasPermission(false);
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === "granted");
      })();
    });
    return unsubscribe;
  }, [props.navigation]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    cdata["qr"] = data;
    props.navigation.navigate("Details");
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView style={styles.constainerCamera}>
      <StatusBar animated={true} backgroundColor="black" />
      <View style={styles.headerView}>
        <Ionicons
          name="arrow-back"
          size={32}
          color="black"
          style={styles.backIcon}
        />
        <Text style={styles.titleText}>Scan QR Code</Text>
        <Text style={styles.shortTitleText}>
          Scan QR Code to start uploading photos
        </Text>
        <Ionicons name="menu" size={32} color="black" style={styles.menuIcon} />
      </View>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.barcodeView}
      >
        <Svg
          width="143"
          height="155"
          viewBox="0 0 143 155"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10.5 0H26.5V5H10.5C7.46243 5 5 7.46243 5 10.5V21.5H0V10.5C0 4.70101 4.70101 0 10.5 0ZM0 131.5V144.5C0 150.299 4.70101 155 10.5 155H26.5V150H10.5C7.46243 150 5 147.538 5 144.5V131.5H0ZM138 131.5V144.5C138 147.538 135.538 150 132.5 150H116.5V155H132.5C138.299 155 143 150.299 143 144.5V131.5H138ZM143 21.5V10.5C143 4.70101 138.299 0 132.5 0H116.5V5H132.5C135.538 5 138 7.46243 138 10.5V21.5H143Z"
            fill="#1390D7"
          />
        </Svg>
        <Text style={styles.qrText}>Scan QR Code</Text>
      </BarCodeScanner>
    </SafeAreaView>
  );
}

function DetailsScreen(props) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(CameraType.back);
  let cameraRef = useRef();
  const [photo, setPhoto] = useState();

  useEffect(() => {
    const unsubscribe = props.navigation.addListener("focus", () => {
      setHasPermission(false);
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      })();
      return unsubscribe;
    });
  }, [props.navigation]);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const takePhoto = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false,
    };
    let nphoto = await cameraRef.current.takePictureAsync(options);
    cdata["photo"] = nphoto;
    props.navigation.navigate("Last");
  };

  return (
    <SafeAreaView style={styles.constainerCamera}>
      <StatusBar animated={true} backgroundColor="black" />
      <View style={styles.headerView}>
        <Ionicons
          onPress={() => props.navigation.goBack()}
          name="arrow-back"
          size={32}
          color="black"
          style={styles.backIcon}
        />
        <Text style={styles.titleText}>Jalal Ahmed</Text>
        {/* <Text style={{ fontSize: 12, color: "grey", fontWeight: "200" }}>
          Looking to Invest in Golf Floras
        </Text> */}
        <Ionicons name="menu" size={32} color="black" style={styles.menuIcon} />
      </View>
      <Camera
        autoFocus={false}
        style={styles.cameraStyling}
        type={type}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            {cdata.qr == "Passport"
              ? `Upload ${cdata.qr} size photo`
              : `Upload CNIC ${cdata.qr}`}
          </Text>
        </View>
      </Camera>
      <View style={styles.bottomBar}>
        <Text style={styles.cancelText}>Cancel</Text>
        <Svg
          width="70"
          height="70"
          viewBox="0 0 70 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onPress={takePhoto}
        >
          <Circle cx="35" cy="35" r="35" fill="#3A3F47" />
          <Circle
            cx="35"
            cy="35"
            r="28"
            fill="#3A3F47"
            stroke="#F3F3F3"
            stroke-width="2"
          />
        </Svg>
        <Ionicons
          name="camera-reverse-outline"
          size={32}
          style={styles.cameraReverse}
        />
      </View>
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Last" component={LastScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  imageContainer: {
    position: "absolute",
    top: 30,
    bottom: 30,
    left: 0,
    right: 0,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: 300,
    width: "100%",
    resizeMode: "contain",
  },
  cameraReverse: {
    position: "absolute",
    right: 25,
  },
  cancelText: {
    position: "absolute",
    left: 25,
    fontSize: 18,
    color: "black",
    fontWeight: "400",
  },
  bottomBar: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
  },
  overlayText: {
    color: "white",
    fontSize: 18,
    fontWeight: "400",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: "100%",
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraStyling: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  menuIcon: {
    position: "absolute",
    right: 5,
  },
  titleText: {
    fontSize: 18,
    color: "black",
    fontWeight: "400",
  },
  backIcon: {
    position: "absolute",
    left: 5,
  },
  headerView: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  qrText: {
    marginTop: 20,
    color: "white",
    fontSize: 14,
    fontWeight: "400",
  },
  barcodeView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: 1,
  },
  shortTitleText: {
    fontSize: 12,
    color: "grey",
    fontWeight: "200",
  },
  constainerCamera: {
    flex: 1,
    backgroundColor: "black",
  },
  containerSimple: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerViewLast: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
  },
  overlayFlex: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: "100%",
    padding: 40,
    position: "absolute",
    top: 65,
    justifyContent: "center",
    alignItems: "center",
  },
  loadTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  loadDescription: {
    fontSize: 12,
    fontWeight: "400",
  },
  uploadDocButton: {
    backgroundColor: "#1390D7",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
  },
  UploadButtonText: {
    position: "absolute",
    right: 25,
    fontSize: 18,
    fontWeight: "400",
  },
});
