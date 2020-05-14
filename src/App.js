import React, { useState } from 'react';
import axios from 'axios'

export const App = () => {
  const [ address1, setAddress1 ] = useState('')
  const [ address2, setAddress2 ] = useState('')
  const [ radius, setRadius ] = useState(200)
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
      let locations = {
        address1Coordinates: {
          lat: apiResponse.data.routes[0].legs[0].start_location.lat,
          lng: apiResponse.data.routes[0].legs[0].start_location.lng
        },
        address2Coordinates: {
          lat: apiResponse.data.routes[0].legs[0].end_location.lat,
          lng: apiResponse.data.routes[0].legs[0].end_location.lng
        },
        centralLat: (apiResponse.data.routes[0].legs[0].end_location.lat + apiResponse.data.routes[0].legs[0].start_location.lat)/2,
        centralLng: (apiResponse.data.routes[0].legs[0].end_location.lng + apiResponse.data.routes[0].legs[0].start_location.lng)/2
      }
      if (locations.centralLat !== undefined && locations.centralLng !== undefined ) {
        getParks(locations)
      }
    }
  }

  //find parks nearby
  const getParks = async (locations) => {
    try {
      await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${locations.centralLat},${locations.centralLng}&radius=${radius}&type=park&key=${process.env.REACT_APP_API_KEY}`)
      .then(apiResponse => {
        if (apiResponse.data.status === "INVALID_REQUEST") {
          setErrorMessage(apiResponse.data.status)
          setLoading(false)
        } else {
          console.log(apiResponse, 'apiResponse')
          apiResponse.data.results.map(park => {
            park.distancetoAddress1 = getDistanceFromLatLonInKm(park.geometry.location.lat, park.geometry.location.lng, locations.address1Coordinates.lat, locations.address1Coordinates.lng)
            park.distancetoAddress2 = getDistanceFromLatLonInKm(park.geometry.location.lat, park.geometry.location.lng, locations.address2Coordinates.lat, locations.address2Coordinates.lng)
          })

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

  function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  console.log(errorMessage)
  console.log(parks)

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
          <select 
            value={radius}
            id="cars"
            onChange={e => setRadius(e.target.value)}
            >
              <option value="100">100m</option>
              <option value="200">200m</option>
              <option value="500">500m</option>
              <option value="1000">1000m</option>
          </select>
          <button
          type="button"
          onClick={() => {
            getCoordinates()
            setErrorMessage('')
            setParks({})
          }}
          onKeyDown={() => {
            getCoordinates()
            setErrorMessage('')
            setParks({})
          }}
          >Let's meet</button>
          </div>
          {errorMessage !== '' && <div className="error-message">
            {errorMessage === "ZERO_RESULTS" ? 
            <p>Please refine your search terms...</p> : errorMessage === "404" ?
            <p>Something went wrong..sorry</p> : errorMessage === "NOT_FOUND" ?
            <p>Please refine your search terms...</p> : errorMessage === "INVALID_REQUEST" ? 
            <p>Something went wrong...sorry</p> : ''}
          </div>}
          {parks.data && parks.data.results &&
          <div className="parks-container">
            <div>
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
                    <div>
                      <p>Distance to First Address: {park.distancetoAddress1.toFixed(2)}km</p>
                      <p>Distance to Second Address: {park.distancetoAddress2.toFixed(2)}km</p>
                    </div>
                  </li>
                )}
              </ul>
              }
            </div>
          </div>}
      </div>
      <div className="image phone"><div className="inner"><img src="/images/screen.png" alt="screen" /></div></div>
    </div>
  );
}