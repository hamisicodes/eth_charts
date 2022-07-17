import { Line } from "react-chartjs-2";
import axios from "axios";
import { useState, useEffect } from "react";
import { Chart as ChartJS } from "chart.js/auto";

function App() {
  const [baseFeePerGas, setBaseFeePerGas] = useState([]);
  const [oldestBlock, setOldestBlock] = useState(0);
  
  const blockGenerator = () => {
    let blocks = [];
    for (let i = oldestBlock; i <= oldestBlock + 100; i++) {
      blocks.push(i);
    }
    return blocks;
  };
  const state = {
    labels: blockGenerator(),
    datasets: [
      {
        label: "Base Fee in Gwei",
        fill: false,
        lineTension: 0.5,
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(0,0,0,1)",
        borderWidth: 2,
        data: baseFeePerGas.map((data) => parseInt(data, 16) / 1000000000),
      },
    ],
  };

  const alchemy_url = process.env.REACT_APP_ALCHEMY_URL;
  const alchemy_api_key = process.env.REACT_APP_ALCHEMY_API_KEY;

  const fetchFeeHistory = async () => {
    const postData = {
      jsonrpc: "2.0",
      method: "eth_feeHistory",
      params: [100, "latest"],
      id: 1,
    };
    const response = await axios.post(
      `${alchemy_url}/${alchemy_api_key}`,
      postData
    );
    const baseFee = response.data.result.baseFeePerGas;
    const oldest = parseInt(response.data.result.oldestBlock, 16);
    setBaseFeePerGas([...baseFee]);
    setOldestBlock(oldest);
  };

  useEffect(() => {
    fetchFeeHistory();
  }, [baseFeePerGas, oldestBlock]);

  return (
    <div className="App">
      <Line
        data={state}
        options={{
          title: {
            display: true,
            text: "Average Rainfall per month",
            fontSize: 20,
          },
          legend: {
            display: true,
            position: "right",
          },
        }}
      />
    </div>
  );
}

export default App;
