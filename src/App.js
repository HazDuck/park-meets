import React, { useState } from 'react';
import axios from 'axios'

export const App = () => {
  const [ address1, setAddress1 ] = useState('')
  const [ address2, setAddress2 ] = useState('')
  const [ radius, setRadius ] = useState()
  const [ loading, setLoading ] = useState(false)
  const [ parks, setParks ] = useState({})
  const [ errorMessage, setErrorMessage ] = useState('')

  //get co ordinates of addresses
  const getCoordinates = async () => {
    setLoading(true)
    let apiResponse
    try {
      await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=”${address1}”&destination=”${address2}”&key=${process.env.REACT_APP_API_KEY}`)
      .then(data => {
        apiResponse = {data: data.data, status: data.data.status}
        calculateCentralLocation(apiResponse)
      })
    } 
    catch(error) {
      setErrorMessage('404')
      setLoading(false)
    } 
  }

  //find central location of addresses
  const calculateCentralLocation = (apiResponse) => {
    if (apiResponse.status !== "OK") {
      setErrorMessage(apiResponse.status)
      setLoading(false)
    }
    if (apiResponse && apiResponse.data && apiResponse.data.routes[0] && apiResponse.data.routes[0].legs[0]) {
      let centralLocation = {
        lat: (apiResponse.data.routes[0].legs[0].end_location.lat + apiResponse.data.routes[0].legs[0].start_location.lat)/2,
        lng: (apiResponse.data.routes[0].legs[0].end_location.lng + apiResponse.data.routes[0].legs[0].start_location.lng)/2
      }
      if (centralLocation.lat !== undefined && centralLocation.lng !== undefined ) {
        getParks(centralLocation)
      }
    }
  }

  //find parks nearby
  const getParks = async (centralLocation) => {
    try {
      await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${centralLocation.lat},${centralLocation.lng}&radius=${radius}&type=park&key=${process.env.REACT_APP_API_KEY}`)
      .then(apiResponse => {
        if (apiResponse.data.status === "INVALID_REQUEST") {
          setErrorMessage(apiResponse.data.status)
          setLoading(false)
        } else {
          setParks({
            data: apiResponse.data, 
            status: apiResponse && apiResponse.data && apiResponse.data.status ? apiResponse.data.status : 'fail'
          })
          setLoading(false)
        }
      }) 
    } 
    catch(error) {
      console.log(error)
    }
  }

  console.log(parks)

  // function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  //   var R = 6371; // Radius of the earth in km
  //   var dLat = deg2rad(lat2-lat1);  // deg2rad below
  //   var dLon = deg2rad(lon2-lon1); 
  //   var a = 
  //     Math.sin(dLat/2) * Math.sin(dLat/2) +
  //     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
  //     Math.sin(dLon/2) * Math.sin(dLon/2)
  //     ; 
  //   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  //   var d = R * c; // Distance in km
  //   return d;
  // }
  
  // function deg2rad(deg) {
  //   return deg * (Math.PI/180)
  // }

  return (
    <div className="app-container">
      <div className="main-container">
        <div className="title-container">
          <div className="title-container-inner">
            <h1>ParkMeets</h1>
            <p>Give ParkMeets two addesses and we will find you parks and outdoor spaces in the middle to meet at</p>
          </div>
        </div>
        <div className="inputs-container">
          <input
            id="address1"
            type="text"
            value={address1}
            placeholder="First address"
            onChange={e => setAddress1(e.target.value)}
          ></input>
          <input
            id="address2"
            type="text"
            value={address2}
            onChange={e => setAddress2(e.target.value)}
            placeholder="Second address"
          ></input>
          <input
            id="radius"
            type="text"
            value={radius}
            placeholder="Search radius (m)"
            onChange={e => setRadius(e.target.value)}
          ></input>
          <button
          type="button"
          onClick={() => {
            getCoordinates()
            setErrorMessage('')
          }}
          onKeyDown={() => {
            getCoordinates()
            setErrorMessage('')
          }}
          >Let's meet</button>
          </div>
          {parks.data && parks.data.results &&
          <div className="parks-container">
            {errorMessage === "ZERO_RESULTS" ? 
            <p>Please refine your search terms...</p> : errorMessage === "404" ?
            <p>Something went wrong..sorry</p> : errorMessage === "NOT_FOUND" ?
            <p>Please refine your search terms...</p> : errorMessage === "INVALID_REQUEST" ? 
            <p>Something went wrong...sorry</p> : ''}

            {parks.status === "ZERO_RESULTS" && (
              <p>There are no parks within {radius}m of the mid-point</p>
            )}

            {loading ? <p>'loading...'</p> : parks.data && parks.data.results &&
            <ul>
              {parks.data.results.map(park => 
                <li key={park.id}>
                  <a href={`https://www.google.com/maps/place/?q=place_id:${park.place_id}`} target="_blank">{park.name}</a>
                  { park.vicinity &&  
                  `, ${park.vicinity}`
                  }
                  <p>Rating: {park.rating !== undefined ? park.rating : "N/A"}</p>
                </li>
              )}
            </ul>
            }
          </div>}
      </div>
      <div className="image phone"><div className="inner"><img src="/images/screen.png" alt="screen" /></div></div>
    </div>
  );
}