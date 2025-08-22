import React, { useContext, useEffect, useRef, useState } from 'react';
import type { GetRef, InputRef, TableProps } from 'antd';
import { Form, Input, Popconfirm, Table, DatePicker } from 'antd';
import dayjs from 'dayjs';


type FormInstance<T> = GetRef<typeof Form<T>>;
const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps<T> {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof T;
  record: T;
  handleSave: (record: T) => void;
  type?: "text" | "number" | "date";
}

const EditableCell = <T extends { key: React.Key }>({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  type,
  ...restProps
}: React.PropsWithChildren<EditableCellProps<T>>) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    const value = record[dataIndex];
    const initialValue =
      type === "date" && value ? dayjs(value as string) : value;
    form.setFieldsValue({
      [dataIndex]: dayjs.isDayjs(initialValue) && initialValue.isValid() ? initialValue : null,
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      if (type === "date" && values[dataIndex]) {
        values[dataIndex] = values[dataIndex].format("YYYY-MM-DD");
      }
      handleSave({ ...record, ...values });
    } catch (errInfo) {
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex as string}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        {type === "date" ? (
          <DatePicker
            ref={inputRef as any}
            onChange={(date) => {
              form.setFieldsValue({
                [dataIndex]: date,
              });
              save();
            }}
            format="YYYY-MM-DD"
          />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}
      >
        {type === "date" && children
          ? dayjs(children as string).isValid()
            ? dayjs(children as string).format("YYYY-MM-DD")
            : "Invalid Date"
          : children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type ColumnTypes<T> = Exclude<TableProps<T>['columns'], undefined>;

interface EditableTableProps<T extends { key: React.Key }> {
  dataSource: T[];
  setDataSource: React.Dispatch<React.SetStateAction<T[]>>;
  columns: (ColumnTypes<T>[number] & { editable?: boolean; dataIndex: keyof T; type?: "text" | "number" | "date" })[];
}

const EditableTable = <T extends { key: React.Key }>({
  dataSource,
  setDataSource,
  columns,
}: EditableTableProps<T>) => {
  const handleDelete = (key: React.Key) => {
    setDataSource((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSave = (row: T) => {
    setDataSource((prev) => {
      const index = prev.findIndex((item) => item.key === row.key);
      const newData = [...prev];
      newData.splice(index, 1, { ...prev[index], ...row });
      return newData;
    });
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell<T>,
    },
  };

  const defaultActionColumn = {
    title: 'Hành động',
    dataIndex: 'operation',
    render: (_: any, record: T) => (
      <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
        <a>Delete</a>
      </Popconfirm>
    ),
  };

  const enhancedColumns = [
    ...columns.map((col) =>
      col.editable
        ? {
            ...col,
            onCell: (record: T) => ({
              record,
              editable: col.editable,
              dataIndex: col.dataIndex,
              title: col.title,
              handleSave,
              type: col.type,
            }),
          }
        : col
    ),
    defaultActionColumn,
  ];

  return (
    <Table<T>
      components={components}
      rowClassName={() => 'editable-row'}
      bordered
      dataSource={dataSource}
      columns={enhancedColumns as ColumnTypes<T>}
      scroll={{ x: "max-content" }}
      pagination={false}
    />
  );
};

export default EditableTable;
