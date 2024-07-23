import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Network from "expo-network";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome"; // Import FontAwesome icon set
import { BASE_URL } from "../config";

const AddItem = ({ navigation, route }) => {
  const [objectCode, setObjectCode] = useState("");
  const [objectType, setObjectType] = useState("");
  const [creator, setCreator] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [state, setState] = useState("");
  const [comment, setComment] = useState("");
  const [beginDate, setBeginDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEntered, setIsEntered] = useState(false);
  const [isExited, setIsExited] = useState(false);
  const [location, setLocation] = useState(null);
  const [showObjectTypeModal, setShowObjectTypeModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isViewingPhoto, setIsViewingPhoto] = useState(false);

  const objectTypes = ["BPE", "CHAMBRE", "ODF", "SITE"];
  const states = ["Bon", "Mauvais", "Critique"];

  useEffect(() => {
    (async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      // Request camera and gallery permissions
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(
        cameraStatus === "granted" && mediaStatus === "granted"
      );
    })();
  }, []);

  useEffect(() => {
    if (route.params?.item) {
      const item = route.params.item;
      setObjectCode(item.objectCode);
      setObjectType(item.objectType);
      setCreator(item.creator);
      setProjectCode(item.projectCode);
      setState(item.state);
      setComment(item.comment);
      setBeginDate(new Date(item.beginDate).toLocaleString());
      setIsEntered(true);
      if (item.endDate) {
        setEndDate(new Date(item.endDate).toLocaleString());
        setIsExited(true);
        setIsViewOnly(true); // Set to true if the item has been exited
      } else {
        setIsViewOnly(false); // Allow editing if the item hasn't been exited
      }
    }
  }, [route.params]);

  const isFullyCompleted = isEntered && isExited;

  const handleEnter = async () => {
    // Check for empty or whitespace-only fields
    if (!objectCode.trim() || !objectType.trim() || !creator.trim()) {
      Alert.alert(
        "Error",
        "Object Code, Object Type, and Creator are required and cannot be just spaces"
      );
      return;
    }
    if (isEntered) {
      Alert.alert("Error", "You have already entered");
      return;
    }

    if (!objectCode || !objectType || !creator) {
      Alert.alert(
        "Error",
        "Object Code, Object Type, and Creator are required"
      );
      return;
    }

    const existingItem = await getItem(objectCode);
    if (existingItem) {
      Alert.alert("Error", "An item with this Object Code already exists");
      return;
    }

    const currentDateTime = new Date();
    setBeginDate(currentDateTime.toLocaleString());
    setIsEntered(true);

    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
    const id = Date.now().toString(); // Generate a unique ID based on the current timestamp

    const itemData = {
      objectCode,
      objectType,
      creator,
      latitude: currentLocation.coords.latitude.toString(),
      longitude: currentLocation.coords.longitude.toString(),
      beginDate: currentDateTime.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      comment,
      state,
      projectCode,
    };

    await saveItem(itemData);
    navigation.navigate("ListItems", { newItem: itemData });
  };
  // Update handleExit
  const handleExit = async () => {
    if (!isEntered) {
      Alert.alert("Error", "You must enter before exiting");
      return;
    }
    if (isExited) {
      Alert.alert("Error", "You have already exited");
      return;
    }

    const currentDateTime = new Date();
    setEndDate(currentDateTime.toLocaleString());
    setIsExited(true);
    setIsViewOnly(true); // Set to true after exiting

    // Retrieve and update item data
    const itemData = await getItem(objectCode);
    if (itemData) {
      itemData.endDate = currentDateTime.toISOString();
      await saveItem(itemData);
      navigation.navigate("ListItems", { updatedItem: itemData });
    } else {
      Alert.alert("Error", "Item not found");
    }
  };

  const saveItem = async (itemData) => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isInternetReachable) {
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(`${BASE_URL}/api/pointing`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(itemData),
        });
        console.log(itemData, "aa");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("Data synchronized with server successfully");
        itemData.synced = true;
      } else {
        itemData.synced = false;
        console.log("No internet connection, data will be synced later");
      }

      const key = `item_${itemData.objectCode}`;
      await AsyncStorage.setItem(key, JSON.stringify(itemData));
      console.log("Data saved to local storage successfully");
    } catch (error) {
      console.error("Error saving item:", error.message);
      itemData.synced = false;
      const key = `item_${itemData.objectCode}`;
      await AsyncStorage.setItem(key, JSON.stringify(itemData));
    }
  };

  const getItem = async (objectCode) => {
    try {
      const key = `item_${objectCode}`;
      console.log("Fetching item with key:", key); // Debug log
      const value = await AsyncStorage.getItem(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error("Error getting item:", error);
    }
  };

  const handleCameraPress = async () => {
    if (!hasGalleryPermission) {
      Alert.alert("Error", "Camera and gallery permissions are required");
      return;
    }

    setIsViewingPhoto(false);

    Alert.alert(
      "Choose an option",
      "Would you like to take a picture or choose from the gallery?",
      [
        {
          text: "Take Picture",
          onPress: takePicture,
        },
        {
          text: "Choose from Gallery",
          onPress: pickImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setComment(``);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setComment(""); // Clear the comment when a photo is selected
    }
  };
  const handlePhotoOptions = () => {
    Alert.alert("Photo Options", "What would you like to do?", [
      {
        text: "View Photo",
        onPress: () => setIsViewingPhoto(true),
      },
      {
        text: "Delete Photo",
        onPress: handleDeletePhoto,
        style: "destructive",
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };
  const handleDeletePhoto = () => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => {
          setSelectedImage(null);
          setComment("");
        },
        style: "destructive",
      },
    ]);
  };
  const renderPhotoViewerModal = () => (
    <Modal
      visible={isViewingPhoto}
      transparent
      animationType="fade"
      onRequestClose={() => setIsViewingPhoto(false)}
    >
      <View style={styles.fullScreenModalContainer}>
        <Image
          source={{ uri: selectedImage }}
          style={styles.fullScreenPhotoViewer}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={styles.fullScreenCloseButton}
          onPress={() => setIsViewingPhoto(false)}
        >
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderInputField = (
    label,
    value,
    onChangeText,
    required = false,
    editable = true
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.commentContainer}>
        <TextInput
          style={[
            styles.input,
            (!editable ||
              isViewOnly ||
              (label === "Heure de sortie" && isExited)) &&
              styles.disabledInput,
            label === "Commentaire" && styles.multilineInput, // Add multiline styles
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={
            editable &&
            !isViewOnly &&
            !(label === "Heure de sortie" && isExited)
          }
          multiline={label === "Commentaire"} // Enable multiline only for "Commentaire"
          numberOfLines={label === "Commentaire" ? 4 : 1} // Set default height for multiline input
        />
        {label === "Commentaire" && !isViewOnly && !isExited && (
          <TouchableOpacity
            onPress={selectedImage ? handlePhotoOptions : handleCameraPress}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
              />
            ) : (
              <Icon
                name="camera"
                size={24}
                color="#003366"
                style={styles.cameraIcon}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  const renderSelectField = (label, value, onPress, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[
          styles.selectField,
          (isViewOnly || isExited) && styles.disabledInput,
        ]}
        onPress={!isViewOnly && !isExited ? onPress : null}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || label}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderModal = (visible, data, onSelect, onClose) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.form}>
          {renderInputField(
            "Numéro SEP ou SITE ou CHAMBRE",
            objectCode,
            setObjectCode,
            true,
            !isEntered
          )}
          {renderSelectField(
            "Type objet",
            objectType,
            () => setShowObjectTypeModal(true),
            true
          )}
          {renderModal(showObjectTypeModal, objectTypes, setObjectType, () =>
            setShowObjectTypeModal(false)
          )}
          {renderInputField(
            "Nom d'utilisateur",
            creator,
            setCreator,
            true,
            !isEntered
          )}
          {renderInputField(
            "Code Projet",
            projectCode,
            setProjectCode,
            false,
            !isExited
          )}
          {renderSelectField(
            "Etat",
            state,
            () => setShowStateModal(true),
            false
          )}
          {renderModal(showStateModal, states, setState, () =>
            setShowStateModal(false)
          )}
          {renderInputField(
            "Commentaire",
            comment,
            setComment,
            false,
            !isExited
          )}
          {renderInputField(
            "Heure de l'entrée",
            beginDate,
            setBeginDate,
            false,
            false
          )}
          {isEntered &&
            renderInputField(
              "Heure de sortie",
              endDate,
              setEndDate,
              false,
              false // Disable editing for exit date
            )}

          <View style={styles.buttonContainer}>
            {!isViewOnly && !isEntered && (
              <TouchableOpacity
                style={[styles.button, styles.enterButton]}
                onPress={handleEnter}
              >
                <Text style={styles.buttonText}>Entrer</Text>
              </TouchableOpacity>
            )}
            {isEntered && !isExited && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.exitButton,
                  styles.fullWidthButton,
                ]}
                onPress={handleExit}
              >
                <Text style={styles.buttonText}>Sortir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
      {renderPhotoViewerModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  fullWidthButton: {
    flex: 1,
    marginLeft: 0,
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
    flex: 1,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
  },
  selectedImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
    alignItems: "center",
  },
  photoViewer: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#003366",
    borderRadius: 5,
  },

  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectField: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 5,
    padding: 15,
    backgroundColor: "#fff",
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  fullScreenPhotoViewer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  multilineInput: {
    height: 100, // Adjust height as needed
    textAlignVertical: "top",
  },
  fullScreenCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
  },
  selectText: {
    fontSize: 16,
  },
  placeholderText: {
    color: "#999",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  enterButton: {
    backgroundColor: "#01385E",
    marginRight: 5,
  },
  exitButton: {
    backgroundColor: "#cccccc",
    marginLeft: 5,
    backgroundColor: "#01385E",

  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cameraIcon: {
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#003366",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cameraIcon: {
    marginLeft: 10,
  },
  selectedImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
});

export default AddItem;
