import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';
import { Table } from '@finos/perspective';

interface IState {
  data: ServerRespond[];
  showGraph: boolean;
}

type TableData = Record<string, (string | number | boolean | Date)[]>[];

class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      data: [],
      showGraph: false,
    };

    this.getDataFromServer = this.getDataFromServer.bind(this);
  }

  loadTable = (table: Table) => {
    const data = this.state.data;

    const dataFormatted: TableData = data.map(row => {
      const formattedRow: Record<string, (string | number | boolean | Date)[]> = {};
      Object.entries(row).forEach(([key, value]) => {
        formattedRow[key] = [value as string | number | boolean | Date];
      });
      return formattedRow;
    });

    table.update(dataFormatted);
  };

  renderGraph() {
    if (this.state.showGraph) {
      return <Graph data={this.state.data} color="blue" load={this.loadTable} />;
    }
  }

  getDataFromServer() {
    let x = 0;
    const interval = setInterval(() => {
      DataStreamer.getData((serverResponds: ServerRespond[]) => {
        this.setState({
          data: serverResponds,
          showGraph: true,
        });
      });
      x++;
      if (x > 1000) {
        clearInterval(interval);
      }
    }, 100);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">Bank Merge & Co Task 3</header>
        <div className="App-content">
          <button
            className="btn btn-primary Stream-button"
            onClick={this.getDataFromServer}
          >
            Start Streaming Data
          </button>
          <div className="Graph">{this.renderGraph()}</div>
        </div>
      </div>
    );
  }
}

export default App;







