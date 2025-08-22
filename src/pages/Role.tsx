import { useEffect, useState } from "react";
import Table from "../components/Table";
import useFetchList from "../hooks/useFetchList";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";
import { ENDPOINT } from "../routers/endpoint";
import useFetchRole from "../hooks/useFetchRole";
import { RoleColumns } from "../utils/constants/columns/roleColumns";
import { RoleEditFields } from "../utils/constants/edit_fields/roleEditFields";
import { FunctionRecord } from "@/types/function";
import { RoleCreateFields } from "@/utils/constants/create_fields/roleCreateFields";
import { Constants } from "@/utils/constants/constants";
import { RoleRecord } from "@/types/role";


const Role: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState<number>(Number(localStorage.getItem(Constants.LOCAL_STORAGE_KEY + "-" + ENDPOINT.ROLE)) || 10);
  const { data, error, totalRecords, setParams, totalPages } = useFetchRole<RoleRecord>(`${ENDPOINT.ROLE}/all`, {
    pageNumb: currentPage,
    pageSize: pageSize,
    sorts: null,
    name: null
  });

  const { data : functionData } = useFetchList<FunctionRecord>(`${ENDPOINT.FUNCTION}/all`, {});

  const functionOptions = functionData
    ? functionData.map((func) => ({
        value: func.logic_id,
        label: func.function_name,
      }))
    : [];

  const updatedFunctionEditFields = RoleEditFields.map((field) =>
    field.name === "functions"
      ? { ...field, options: functionOptions }
      : field
  );

  const handlePageResize = (newSize: number) => {
    localStorage.setItem(Constants.LOCAL_STORAGE_KEY + "-" + ENDPOINT.ROLE, newSize.toString());
    setPageSize(newSize);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, newSize);
  };

  const handleParamsChange = (page: number, searchTerm: string, pagesize?: number | null) => {
    setParams({
      pageNumb: page,
      pageSize: pagesize,
      sorts: null,
      name: searchTerm,
    });
    if (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Role Groups</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href='/dashboard'>CMS</a></li>
              <li className="breadcrumb-item">Users</li>
              <li className="breadcrumb-item">Role Groups</li>
            </ol>
          </nav>
        </div>
        <div
          style={{
            padding: "2%",
            backgroundColor: "#fff",
            boxShadow: "0px 0px 20px #8c98a4",
          }}
        >
          <Table 
            tableName="Role Groups List" 
            isCreatable={true} 
            createFields={RoleCreateFields}
            columns={RoleColumns} 
            data={data} 
            editFields={updatedFunctionEditFields} 
            isImportable={false} 
            onSearch={(searchTerm: string) => {
              setSearchTerm(searchTerm);
              setCurrentPage(1);
              handleParamsChange(1, searchTerm, pageSize);
            }} 
            endpoint={ENDPOINT.ROLE} 
            trueLabel="Hoạt động"
            falseLabel="Khóa"
          />
          <Pagination 
            pageSize={pageSize} 
            numOfRecords={totalRecords} 
            currentPage={currentPage} 
            onPageChange={(page: number) => {
              setCurrentPage(page);
              handleParamsChange(page, searchTerm, pageSize);
            }} 
            onPageSizeChange={handlePageResize}
            totalPage={totalPages} 
          />
        </div>
      </main>
    </>
  );
};
export default Role;