import React, { useState, useEffect } from "react";
import "./App.css";
const BaseURL = "http://localhost:8000";

function App() {


  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Valve</th>
            <th>Pressure</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hallway 7B - 15423</td>
            <td className="danger">534</td>
          </tr> 
          <tr>
            <td>Hallway 223 - 25423</td>
            <td className="good">101</td>
          </tr> 
          <tr>
            <td>Hallway A12G - 323</td>
            <td className="warning">54</td>
          </tr> 
        </tbody>
      </table>
    </div>
  );
}
export default App