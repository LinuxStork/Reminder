import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';

PushNotification.createChannel(
  {
    channelId: 'LinuxStorkProCustomid69hhafunnybtwiusearch',
    channelName: 'LinuxStork',
    channelDescription: 'btw i use arch',
    soundName: 'default',
    importance: 5,
    vibrate: true,
  },
  created => console.log(`createChannel returned '${created}'`),
);

const storeData = async value => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('@storage_Key', jsonValue);
  } catch (e) {
    // saving error
  }
};

const getData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@storage_Key');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
};

export default function App() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [data, setData] = useState({
    title: [],
    text: [],
    date: [],
  });
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      const savedData = await getData();
      if (savedData) {
        setData(savedData);
      }
    };

    loadData();
  }, []);

  const sendNotification = () => {
    const dateSet = data.date[selectedItemIndex];
    let notificationDate;

    if (dateSet) {
      notificationDate = new Date(dateSet);
    } else {
      notificationDate = new Date(Date.now() + 1000); // 1 second from now if no date set
    }

    PushNotification.localNotificationSchedule({
      channelId: 'LinuxStorkProCustomid69hhafunnybtwiusearch',
      title: data.title[selectedItemIndex],
      message: data.text[selectedItemIndex],
      date: notificationDate,
      allowWhileIdle: true, // this is required for exact time
    });
    toggleModal();
  };
  const handleDeleteInfo = () => {
    const newData = {
      title: data.title.filter((_, index) => index !== selectedItemIndex),
      text: data.text.filter((_, index) => index !== selectedItemIndex),
      date: data.date.filter((_, index) => index !== selectedItemIndex),
    };
    setData(newData);
    storeData(newData);
    toggleModal();
  };
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleAddInfo = () => {
    const newData = {
      title: [...data.title, title],
      text: [...data.text, text],
      date: [...data.date, date ? date.getTime() : ''],
    };
    setData(newData);
    storeData(newData);
    setTitle('');
    setText('');
    setDate(null);
    toggleModal();
  };

  return (
    <View style={styles.container}>
      <Modal isVisible={isModalVisible}>
        {selectedItemIndex !== null ? (
          <View style={styles.modalContent}>
            <Text style={styles.text}>Do you want to delete this item?</Text>
            <View style={styles.modalTable}>
              <Text style={styles.header}>{selectedItemIndex + 1}.</Text>
              <Text style={styles.cell}>{data.title[selectedItemIndex]}</Text>
              <Text style={styles.cell}>{data.text[selectedItemIndex]}</Text>
              <Text style={styles.cell}>{data.date[selectedItemIndex]}</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                handleDeleteInfo();
                setSelectedItemIndex(null);
              }}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                toggleModal();
                setSelectedItemIndex(null);
              }}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                sendNotification();
                setSelectedItemIndex(null);
              }}>
              <Text style={styles.buttonText}>
                {data.date[selectedItemIndex]
                  ? 'Schedule Notification'
                  : 'Send Notification'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Text"
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
              <Text>
                {date ? date.toLocaleString() : 'Select a Date and Time'}
              </Text>
            </TouchableOpacity>
            {isDatePickerVisible && (
              <DatePicker
                modal
                open={isDatePickerVisible}
                date={date || new Date()}
                onConfirm={selectedDate => {
                  setDatePickerVisible(false);
                  setDate(selectedDate);
                }}
                onCancel={() => {
                  setDatePickerVisible(false);
                }}
              />
            )}
            <TouchableOpacity style={styles.button} onPress={handleAddInfo}>
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={toggleModal}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
      <ScrollView>
        <View style={styles.tableContainer}>
          <View style={styles.row}>
            <Text style={styles.header}>No.</Text>
            <Text style={styles.header}>Title</Text>
            <Text style={styles.header}>Text</Text>
            <Text style={styles.header}>Date</Text>
          </View>
          {data.title.map((titlee, index) => (
            <TouchableOpacity
              key={index}
              style={styles.row}
              onPress={() => {
                setSelectedItemIndex(index);
                toggleModal();
              }}>
              <Text style={styles.header}>{index + 1}.</Text>
              <Text style={styles.cell}>{titlee}</Text>
              <Text style={styles.cell}>{data.text[index]}</Text>
              <Text style={styles.cell}>
                {data.date[index]
                  ? new Date(data.date[index]).toLocaleString()
                  : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tableContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 5,
  },
  modalTable: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'aqua',
    borderRadius: 6,
  },
  text: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'aqua',
    borderRadius: 6,
  },
  header: {
    flex: 1,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  cell: {
    flex: 1,
    color: 'black',
    textAlign: 'center',
    padding: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'aqua',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    margin: 3,
    color: 'black',
    backgroundColor: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'aqua',
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    right: 50,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'aqua',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'aqua',
    borderWidth: 1,
  },
});
