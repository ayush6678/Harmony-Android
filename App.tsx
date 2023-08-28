import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  Button,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Sound from 'react-native-sound';
import * as Progress from 'react-native-progress';

const styles = StyleSheet.create({
  baseText: {
  },
  innerText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '500'
  },
});

function Song(props: { name: string, auth: string, image: string }) {
  return (
    <View style={{ padding: 10, borderColor: 'solid black', display: 'flex', flexDirection: 'row' }}>
      <Image
        style={{ width: 60, height: 60 }}
        source={{
          uri: props.image,
        }}
      />
      <View style={
        {
          padding: 10
        }
      }>
        <Text style={
          styles.innerText
        }>{props.name}</Text>
        <Text style={{ color: 'gray' }}>{props.auth}</Text>
      </View>
    </View >
  );
}

function App() {

  const [songs, setSongs] = useState([]);
  const [filter, setFilter] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState(600);
  const [reach, setReach] = useState(0);
  Sound.setCategory('Playback');

  useEffect(() => {
    axios.get("https://harmony-backend-1rjg.onrender.com/fetchData").then(res => {
      setSongs(res.data);
    });
  }, []);

  useEffect(() => {
    setFilter(songs);

    const filtered = songs.filter((song) => {
      return song.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilter(filtered);

  }, [searchQuery, songs])

  const [songLink, setSongLink] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(["Song", "Artist", "https://t4.ftcdn.net/jpg/03/93/23/51/360_F_393235111_ygEWm52rXjI72T7pyJUOcsDRvf8rY3ON.jpg"]);

  useEffect(() => {
    const song = new Sound(songLink, null, (error) => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      // loaded successfully
      console.log('duration in seconds: ');

      setTotal(song.getDuration());


      const updateTimeInterval = setInterval(() => {
        song.getCurrentTime((seconds) => setReach(seconds))
      }, 1000)


      // Play the sound with an onEnd callback
      if (isPlaying) {
        song.play();
      } else {
        song.stop();
      }
      return () => {
        song.stop();
      }
    });



    return () => {
      song.stop();
    };
  }, [isPlaying, songLink]);

  return (
    <SafeAreaView style={{ backgroundColor: "black", height: 'auto' }}>
      <Text style={{ color: 'white', textAlign: 'center', fontSize: 30, padding: 14 }}>
        Harmony
      </Text>

      <TextInput
        style={{ height: 40, backgroundColor: 'white', marginHorizontal: 20, borderRadius: 5, marginBottom: 25 }}
        onChangeText={setSearchQuery}
        value={searchQuery}
        placeholder='Search for songs' />

      <ScrollView style={{ maxHeight: '75%' }}>

        {filter.map((song) => {

          return (
            <TouchableOpacity
              key={song.name}
              onPress={
                () => {
                  setIsPlaying(!isPlaying);
                  setSongLink(song.accessToken);
                  setCurrent([song.name, song.auth, song.image]);
                }
              }
            >
              <View style={{ backgroundColor: 'black', shadowColor: 'white', margin: 10, elevation: 1 }}>
                <Song name={song.name} auth={song.auth} image={song.image} />
              </View>
            </TouchableOpacity>
          )

        })}

      </ScrollView>

      <View style={{ position: 'absolute', top: '95%', left: '0', zIndex: 0, display: 'flex', backgroundColor: 'gray', minWidth: '100%' }}>

        <View style={{
          padding: 10,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>

          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', zIndex: 2 }}>
            <Image
              style={{ width: 60, height: 60, borderRadius: 3 }}
              source={{
                uri: current[2],
              }}
            />
            <View style={{ padding: 10 }}>
              <Text style={{ color: 'black', fontSize: 14 }}>{current[0]}</Text>
              <Text style={{ fontSize: 10 }}>{current[1]}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={
              () => {
                if (current[0] !== "Song") {
                  setIsPlaying(!isPlaying)
                }
              }
            }
          >
            {!isPlaying ? <Image
              style={{ width: 60, height: 60, borderRadius: 3 }}
              source={require('./play.png')}
            /> :
              <Image
                style={{ width: 55, height: 55, borderRadius: 3 }}
                source={require('./pause.png')}
              />}
          </TouchableOpacity>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ marginLeft: 10, color: 'black' }}>{formatTime(Math.floor(reach))}</Text>
          <View>
            <Progress.Bar progress={reach / total} width={300} color='white' />
          </View>
          <Text style={{ marginRight: 10, color: 'black' }}>{formatTime(Math.floor(total))}</Text>
        </View>

      </View>
    </SafeAreaView >
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

export default App;
