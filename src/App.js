import { Line } from "react-chartjs-2";
import axios from "axios";
import { useState, useEffect } from "react";
import { Chart as ChartJS } from "chart.js/auto";

function App() {
  const [baseFeePerGas, setBaseFeePerGas] = useState([]);
  const [gasPrice, setGasPrice] = useState(0);
  const [oldestBlock, setOldestBlock] = useState(0);

  const blockGenerator = () => {
    let blocks = [];
    for (let i = oldestBlock; i <= oldestBlock + 100; i++) {
      blocks.push(i);
    }
    return blocks;
  };

  const weiToGwei = (data) => parseInt(data, 16) / 1000000000;
  const baseFeeData = {
    labels: blockGenerator(),
    datasets: [
      {
        label: "Base Fee in Gwei",
        fill: true,
        lineTension: 0.5,
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(0,0,0,1)",
        borderWidth: 2,
        data: baseFeePerGas.map((data) => weiToGwei(data)),
      },
    ],
  };

  const minerFeeData = {
    labels: blockGenerator(),
    datasets: [
      {
        label: "Average Miner Fee in Gwei",
        fill: true,
        lineTension: 0.5,
        backgroundColor: "#FFFF00",
        borderColor: "rgba(0,0,0,1)",
        borderWidth: 2,
        data: baseFeePerGas.map(
          (data) => weiToGwei(gasPrice) - weiToGwei(data)
        ),
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

    await fetchMinerFee();
  };

  const fetchMinerFee = async () => {
    const postData = {
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 0,
    };
    const response = await axios.post(
      `${alchemy_url}/${alchemy_api_key}`,
      postData
    );
    const gas = response.data.result;
    setGasPrice(gas);
  };

  useEffect(() => {
    fetchFeeHistory();
  }, [baseFeePerGas, oldestBlock]);

  return (
    <div className="App">
      <Line
        data={baseFeeData}
        options={{
          responsive: true,
          title: {
            display: true,
            text: "Base Fee in all blocks",
            fontSize: 20,
          },
          legend: {
            display: true,
            position: "right",
          },
        }}
      />
      <br />
      <Line
        data={minerFeeData}
        options={{
          responsive: true,
          title: {
            display: true,
            text: "Miner Fee in all blocks",
            fontSize: 20,
          },
          legend: {
            display: true,
            position: "right",
          },
        }}
        annotation={{
          aannotations: [
            {
              type: "line",
              mode: "vertical",
              scaleID: "x-axis-0",
              borderColor: "red",
              label: {
                content: "",
                enabled: true,
                position: "top",
              },
            },
          ],
        }}
      />
    </div>
  );
}

export default App;
