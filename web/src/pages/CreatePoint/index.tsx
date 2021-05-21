import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import axios from 'axios'
import { toast } from 'react-toastify'

import DropZone from '../../components/Dropzone'
import api from '../../services/api'
import logo from '../../assets/logo.svg'
import './styles.css'

interface Item {
  id: number
  title: string
  image_url: string
}

interface IBGEUFResponse {
  sigla: string
}
interface IBGECityResponse {
  nome: string
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0
  ])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0
  ])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedImage, setSelectedImage] = useState<File>()

  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(postition => {
      console.log(postition)
      const { latitude, longitude } = postition.coords
      setInitialPosition([latitude, longitude])
      setSelectedPosition([latitude, longitude])
    })
  }, [])

  useEffect(() => {
    api.get('items').then(response => setItems(response.data))
  }, [])

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla)

        setUfs(ufInitials)
      })
  }, [])

  useEffect(() => {
    if (selectedUf === '0') return

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then(response => {
        const cityNames = response.data.map(city => city.nome)

        setCities(cityNames)
      })
  }, [selectedUf])

  function handleSelectUf (e: ChangeEvent<HTMLSelectElement>) {
    const uf = e.target.value
    setSelectedUf(uf)
  }

  function handleSelectCity (e: ChangeEvent<HTMLSelectElement>) {
    const city = e.target.value
    setSelectedCity(city)
  }

  function handleMapClick (e: LeafletMouseEvent) {
    setSelectedPosition([e.latlng.lat, e.latlng.lng])
    console.log(e.latlng.lat, e.latlng.lng)
  }

  function handleChangeInput (e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  function handleItemClick (id: number) {
    const alreadSelected = selectedItems.findIndex(item => item === id)
    if (alreadSelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id)
      setSelectedItems(filteredItems)
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  async function handleSubmit (e: FormEvent) {
    e.preventDefault()

    const { name, email, whatsapp } = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectedItems
    const data = new FormData()
    data.append('name', name)
    data.append('email', email)
    data.append('whatsapp', whatsapp)
    data.append('city', city)
    data.append('uf', uf)
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('items', items.join(','))
    if (selectedImage) {
      data.append('image', selectedImage)
    }

    await api.post('points', data)

    toast.success('Ponto de coleta salvo com sucesso!')

    history.push('/')
  }

  return (
    <div id='page-create-point'>
      <header>
        <img src={logo} alt='Ecoleta' />
        <Link to='/'>
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do
          <br /> ponto de coleta
        </h1>

        <DropZone onFileSelectedUpload={setSelectedImage} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className='field'>
            <label htmlFor='name'>Nome da entidade</label>
            <input
              type='text'
              name='name'
              id='name'
              onChange={handleChangeInput}
            />
          </div>
          <div className='field-group'>
            <div className='field'>
              <label htmlFor='email'>E-mail</label>
              <input
                type='email'
                name='email'
                id='email'
                onChange={handleChangeInput}
              />
            </div>
            <div className='field'>
              <label htmlFor='whatsapp'>Whatsapp</label>
              <input
                type='text'
                name='whatsapp'
                id='whatsapp'
                onChange={handleChangeInput}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className='field-group'>
            <div className='field'>
              <label htmlFor='uf'>Estado (UF)</label>
              <select
                name='uf'
                id='uf'
                onChange={handleSelectUf}
                value={selectedUf}
              >
                <option value='0'>Selecione a UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className='field'>
              <label htmlFor='city'>Cidade</label>

              <select
                name='city'
                id='city'
                onChange={handleSelectCity}
                value={selectedCity}
              >
                <option value='0'>Selecione a cidade</option>
                {cities.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className='items-grid'>
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type='submit'>Cadastar</button>
      </form>
    </div>
  )
}

export default CreatePoint
