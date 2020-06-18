import React, { useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Linking,
  SafeAreaView
} from 'react-native'
import { Feather as Icon, FontAwesome } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useNavigation, useRoute } from '@react-navigation/native'
import { RectButton } from 'react-native-gesture-handler'
import * as MailComposer from 'expo-mail-composer'
import api from '../../services/api'

interface Params {
  point_id: number
}
interface Data {
  point: {
    image_url: string
    name: string
    email: string
    whatsapp: string
    city: string
    uf: string
  }
  items: {
    title: string
  }[]
}
const Detail: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const routeParams = route.params as Params
  const [data, setData] = useState<Data>({} as Data)

  useEffect(() => {
    api.get(`points/${routeParams.point_id}`).then(response => {
      console.log(response.data)
      setData(response.data)
    })
  }, [])

  function handleNavigateBack () {
    navigation.goBack()
  }

  function handleMailComposer () {
    MailComposer.composeAsync({
      subject: 'Interesse na coleta de resíduos',
      recipients: [data.point.email]
    })
  }

  function handleWhatsapp () {
    Linking.openURL(
      `whatsapp://send?phone=+55${data.point.whatsapp}&text=Tenho interesse`
    )
  }

  if (!data.point) {
    return null
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name='arrow-left' color='#fff' size={20} />
        </TouchableOpacity>
        <Image
          style={styles.pointImage}
          source={{
            uri: data.point.image_url
          }}
        />
        <Text style={styles.pointName}>{data.point.name}</Text>
        <Text style={styles.pointItems}>
          {data.items.map(x => x.title).join(', ')}
        </Text>
        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>
            {data.point.city} - {data.point.uf}
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleWhatsapp}>
          <FontAwesome color='#fff' size={20} name='whatsapp' />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleMailComposer}>
          <Icon color='#fff' size={20} name='mail' />
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  )
}

export default Detail
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 20 + Constants.statusBarHeight
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  address: {
    marginTop: 32
  },

  addressTitle: {
    color: '#322153',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16
  },

  addressContent: {
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium'
  }
})