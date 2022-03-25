import React, { useState } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const projectId = '';
  const projectSecret = '';
  const [content, setContent] = useState<{hash: string | null, contentType: string | null }>({hash: null, contentType: null})

  const uploadIPFS = async (body: FormData, contentType: "plain" | "file") => {
    const auth = "Basic " + btoa(projectId + ":" + projectSecret);
    const response = await fetch("https://ipfs.infura.io:5001/api/v0/add", {
      headers: {
        authorization: auth,
      },
      method: "POST",
      body,
    });
    const { Hash, Name, Size } = await response.json();
    setContent({ hash: Hash, contentType })
    console.log("## Gateway URL", `https://ipfs.infura.io/ipfs/${Hash}`);
  };

  const fetchIPFS = async () => {
    const url = `https://ipfs.infura.io:5001/api/v0/object/data?arg=${content.hash}`
    const auth = "Basic " + btoa(projectId + ":" + projectSecret);
    const response = await fetch(url, {
      headers: {
        authorization: auth,
      },
      method: "POST",
    });

    let result
    if (content.contentType === "plain") {
      result = await response.json();
      alert(result)
    } 
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
    });

    if (!result.cancelled) {
      const body = new FormData();
      const blob =  await fetch(result.uri).then(res => res.blob())
      // @ts-ignore
      body.append("file", blob);
      await uploadIPFS(body, "file")
    }
  };

  const uploadText = () => {
    const body = new FormData();
    body.append("file", JSON.stringify({ name: "John Doe"}), "file");
    uploadIPFS(body, "plain")
  }

  return (
    <View style={styles.container}>
      {!content.contentType && !content.hash ?
      <>
      {/* <Button title="Upload JSON" onPress={uploadText} /> */}
      <Button title="Upload image from camera roll" onPress={pickImage} /> 
      </>
      :
        <>
       <Text>{content.hash}</Text>
       {/* <Button title="Fetch Content" onPress={() => fetchIPFS()} /> */}
       <Button title="Clear" onPress={() => setContent({hash: null, contentType: null})} />
      </>}
      <Image source={{uri: `https://ipfs.infura.io/ipfs/${content.hash}`}} style={{height: 200, width: '80%'}} />
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
});
