import React, { Component, RefObject } from 'react';
import { Table, Schema } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';
import { DataManipulator, Row } from './DataManipulator';

interface IProps {
  data: ServerRespond[];
  color: string;
  load: (table: Table) => void;
}

type TableData = Record<string, (string | number | boolean | Date)[]>[];

class Graph extends Component<IProps> {
  table: Table | undefined;
  perspectiveViewerRef: RefObject<HTMLDivElement>;

  constructor(props: IProps) {
    super(props);
    this.perspectiveViewerRef = React.createRef<HTMLDivElement>();
  }

  componentDidMount() {
    const elem = this.perspectiveViewerRef.current;

    if (elem !== null) {
      const schema = {
        price_abc: 'float',
        price_def: 'float',
        ratio: 'float',
        timestamp: 'date',
        upper_bound: 'float',
        lower_bound: 'float',
        trigger_alert: 'float',
      };

      if (window.perspective && window.perspective.worker) {
        this.table = window.perspective.worker().table(schema);
      }

      if (this.table) {
        this.props.load(this.table);
        elem.setAttribute('view', 'y_line');
        elem.setAttribute('row-pivots', '["timestamp"]');
        elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
        elem.setAttribute('aggregates', JSON.stringify({
          price_abc: 'avg',
          price_def: 'avg',
          ratio: 'avg',
          timestamp: 'distinct count',
          upper_bound: 'avg',
          lower_bound: 'avg',
          trigger_alert: 'avg',
        }));
      }
    }
  }

  componentDidUpdate() {
    if (this.table) {
      const data: Row = DataManipulator.generateRow(this.props.data);

      this.table.schema().then((schema: Schema) => {
        const schemaKeys: string[] = Object.keys(schema);

        const dataFormatted: TableData = schemaKeys.reduce((formattedData, key) => {
          const value: (string | number | boolean | Date)[] = [data[key as keyof Row] as string | number | boolean | Date];
          formattedData.push({ [key]: value });
          return formattedData;
        }, [] as TableData);

        this.table!.update(dataFormatted);
      });
    }
  }

  render() {
    return <div ref={this.perspectiveViewerRef} />;
  }
}

export default Graph;












