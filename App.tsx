import React, { useState } from "react";
import { ActivityIndicator, Button, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from 'expo-image-picker';
// @ts-ignore
import base64 from 'react-native-base64';

export default function App() {
  const projectId = '';
  const projectSecret = '';
  const [content, setContent] = useState<{ hash: string | null, contentType: string | null }>({ hash: null, contentType: null })
  const [activity, setActivity] = useState<{ loading: boolean }>({ loading: false });

  const uploadIPFS = async (body: FormData, contentType: "plain" | "file") => {
    // @ts-ignore
    const auth = "Basic " + base64.encode(projectId + ":" + projectSecret);
    const response = await fetch("https://ipfs.infura.io:5001/api/v0/add", {
      headers: {
        Authorization: auth,
      },
      method: "POST",
      body,
    });
    const { Hash, Name, Size } = await response.json();
    setActivity({ loading: !response.ok });
    setContent({ hash: Hash, contentType });
    console.log("## Gateway URL", `https://ipfs.infura.io/ipfs/${Hash}`);
  };

/*
  const fetchIPFS = async () => {
    // @ts-ignore
    const auth = "Basic " + base64.encode(projectId + ":" + projectSecret);
    const response = await fetch(`https://ipfs.infura.io:5001/api/v0/object/data?arg=${content.hash}`, {
      headers: {
        Authorization: auth,
      },
      method: "POST",
    });

    let result
    if (content.contentType === "plain") {
      result = await response.json();
      alert(result);
    } 
  };
*/

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
    });

    if (!result.cancelled) {
      const body = new FormData();
      const blob = await fetch(result.uri).then(res => res.blob())

      // @ts-ignore
      body.append("file", blob, "file");
      setActivity({ loading: true });
      await uploadIPFS(body, "file");
    }
  };

/*
  const uploadText = () => {
    const body = new FormData();
    body.append("file", JSON.stringify({ name: "John Doe"}), "file");
    uploadIPFS(body, "plain");
  }
*/

  return (
    <View style={styles.container}>
      <ActivityIndicator animating={activity.loading} size="large" color="blue" style={styles.spinner} />
      {!content.contentType && !content.hash ?
        <>
          {/* <Button title="Upload JSON" onPress={uploadText} /> */}
          <Button title="Upload image from camera roll" onPress={pickImage} />
        </>
      :
        <>
          {/* <Button title="Fetch Content" onPress={() => fetchIPFS()} /> */}
          <Text>{content.hash}</Text>
          <Image source={{uri: `https://ipfs.infura.io/ipfs/${content.hash}`}} resizeMode="center" style={styles.image} />
          <Button title="Clear" onPress={() => setContent({hash: null, contentType: null})} />
        </>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: 200,
    width: "80%",
    margin: 20,
  },
  spinner: {
    margin: 20,
  },
});
