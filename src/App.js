import React, { useState } from 'react';
import axios from 'axios'

export const App = () => {
  const [ address1, setAddress1 ] = useState('')
  const [ address2, setAddress2 ] = useState('')
  const [ radius, setRadius ] = useState(200)
  const [ coordinates, setCoordinates ] = useState({})
  const [ loading, setLoading ] = useState(false)

  const getCoordinates = async () => {
    setLoading(true)
    try {
      const apiResponse = await axios.get('https://maps.googleapis.com/maps/api/directions/json?origin=”49 Colvestone Cres, Clapton, London E8 2LG, UK”&destination=”Station Passage, Peckham, London SE15 2JR, UK”&key=PUT API KEY HERE')
      setCoordinates({data: apiResponse.data})
      setLoading(false)
    } 
    catch(error) {
      console.log(error)
    } 
  }

  return (
    <div>
      <input
        type="text"
        value={address1}
        onChange={e => setAddress1(e.target.value)}
        placeholder="Address 1"
      ></input>
      <input
        type="text"
        value={radius}
        onChange={e => setRadius(e.target.value)}
        placeholder="Search Radius (m)"
      ></input>
      <input
        type="text"
        value={address2}
        onChange={e => setAddress2(e.target.value)}
        placeholder="Address 2"
      ></input>
      <button
      onClick={() => getCoordinates()}
      >GO</button>
    </div>
  );
}