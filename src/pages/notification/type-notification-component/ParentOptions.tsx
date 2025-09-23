import React, { useState, useImperativeHandle } from "react";
import { Constants } from "@/utils/constants/constants";
import { ENDPOINT } from "@/routers/endpoint";
import useFetchStudentManagement from "@/hooks/useFetchStudentManagement";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import { buildRoute } from "@/utils/helper/routeHelper";
import { ROUTES } from "@/routers/routes";
import { ParentSelectColumns } from "@/utils/constants/columns/parent/parentSelectColumn";
import useFetchUser from "@/hooks/useFetchUser";
import useFetchParentManagement from "@/hooks/useFetchParentManagement";

export interface ParentOptionsProps {
  parents?: number[];
  onSelectRow?: (id: number) => void;
  handleClearSelection?: () => void;
}

export interface ParentOptionsRef {
  validate: () => boolean;
}

const ParentOptions = React.forwardRef<ParentOptionsRef, ParentOptionsProps>(({
  parents,
  onSelectRow,
  handleClearSelection
}, ref) => {

  useImperativeHandle(ref, () => ({
    validate: () => {
      return Array.isArray(parents) && parents.length > 0;
    }
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(
    Number(localStorage.getItem(Constants.LOCAL_STORAGE_KEY + "-" + ENDPOINT.PARENT)) || 10
  );
  const { data, totalRecords, totalPages, setParams } = useFetchParentManagement(
    `${ENDPOINT.USER}/parents`,
    {
      pageNumb: currentPage,
      pageSize: pageSize,
      searchTerm: searchTerm || null,
    }
  );

  const handlePageResize = (newSize: number) => {
    localStorage.setItem(Constants.LOCAL_STORAGE_KEY + "-" + ENDPOINT.READING, newSize.toString());
    setPageSize(newSize);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, newSize);
  };

  const handleParamsChange = (
    page: number,
    search: string,
    size: number,
  ) => {
    setParams({
      pageNumb: page,
      pageSize: size,
      searchTerm: search || null,
    });
  };

  return (
    <div className="card" >
      <h5 className="card-title">Select parents</h5>
      <div className="card-body">
        <Table
          columns={ParentSelectColumns}
          data={data}
          onSearch={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
            handleParamsChange(1, term, pageSize);
          }}
          endpoint={ENDPOINT.USER}
          isCreatable={false}
          isImportable={false}
          isDeletable={false}
          isEditable={false}
          customActions={[
            {
              action: "View learning history",
              link: (row) => buildRoute(ROUTES.USER, { id: row.id }),
            }
          ]}
          trueLabel="Active"
          falseLabel="Lock"
          onSelectRow={(row: any) => onSelectRow && onSelectRow(row)}
          selectedIds={parents}
          keyId={"id"}
          handleClearSelection={() => handleClearSelection && handleClearSelection()}
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

    </div>
  );
});

export default ParentOptions;
