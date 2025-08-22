import { IHistoryReadingStudent } from "@/diagram/response/student/historyReadingStudent.response";
import useFetchHistoryReadingStudent from "@/hooks/useFetchHistoryReadingStudent";
import { ENDPOINT } from "@/routers/endpoint";
import { ROUTES } from "@/routers/routes";
import { Constants } from "@/utils/constants/constants";
import { useState } from "react";
import Table from "../components/Table";
import { toast } from "react-toastify";
import Pagination from "../components/Pagination";
import { HistoryReadingColumns } from "@/utils/constants/columns/student/historyReadingColumn";
import { CSSTransition } from "react-transition-group";
import { COMPLETION_OPTIONS, PASSED_OPTIONS } from "@/utils/constants/options";
import { useParams } from "react-router-dom";
import Select from 'react-select';
import NotifyModal from "@/components/ui/NotifyModal";

const DetailStudent: React.FC = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(
    Number(localStorage.getItem(Constants.LOCAL_STORAGE_KEY + "-" + ENDPOINT.STUDENT)) || 10
  );
  const { id: studentId } = useParams<{ id: string }>();
  const [selectedCompletion, setSelectedCompletion] = useState<boolean | null>(null);
  const [selectedPassed, setSelectedPassed] = useState<boolean | null>(null);
  const [showNotiModal, setShowNotiModal] = useState(false);
  const { data, error, totalRecords, setParams, totalPages } = useFetchHistoryReadingStudent<IHistoryReadingStudent>(
    `${ENDPOINT.STUDENT_READING}/history-reading`,
    {
      pageNumb: currentPage,
      pageSize: pageSize,
      sorts: null,
      student_id: studentId || "",
      is_completed: null,
      is_passed: null,
    }
  );

  const handleParamsChange = (
    page: number,
    searchTerm?: string | null,
    pagesize?: number | null,
    isCompleted?: boolean | null,
    isPassed?: boolean | null
  ) => {
    if (studentId) {
      setParams({
        pageNumb: page,
        pageSize: pagesize,
        sorts: null,
        student_id: studentId || "",
        title: searchTerm,
        is_completed: isCompleted,
        is_passed: isPassed,
      });
      if (error) {
        toast.error(error);
      }
    }
  };

  const handleIsCompletionChange = (selectedOption: { value: boolean | null; label: string } | null) => {
    const newCompletion = selectedOption ? selectedOption.value : null;
    setSelectedCompletion(newCompletion);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, pageSize, newCompletion, selectedPassed);
  };

  const handleIsPassedChange = (selectedOption: { value: boolean | null; label: string } | null) => {
    const newPassed = selectedOption ? selectedOption.value : null;
    setSelectedPassed(newPassed);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, pageSize, selectedCompletion, newPassed);
  };

  const handlePageResize = (newSize: number) => {
    localStorage.setItem(Constants.LOCAL_STORAGE_KEY + "-" + ENDPOINT.STUDENT_READING + '/history-reading', newSize.toString());
    setPageSize(newSize);
    setCurrentPage(1);
    handleParamsChange(1, searchTerm, newSize, selectedCompletion, selectedPassed);
  };

  const handleNotify = () => {
    // Implement notification logic here
    setShowNotiModal(true);
  };

  return (
    <>
      <main className="main" id="main">
        <div className="pagetitle">
          <h1>Student's learning history</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href={`${ROUTES.DASHBOARD}`}>CMS</a>
              </li>
              <li className="breadcrumb-item">
                <a href={`${ROUTES.STUDENT}`}>Students</a>
              </li>
              <li className="breadcrumb-item active">Student's learing history</li>
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
            customView={
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div>
                  <button
                    style={{ width: '200px' }}
                    type="button"
                    className="btn btn-primary col-2"
                    onClick={handleNotify}
                  >
                    Notify
                  </button>
                </div>
                <div style={{ width: '200px' }}>
                  <Select
                    id="grade-filter"
                    options={COMPLETION_OPTIONS}
                    onChange={handleIsCompletionChange}
                    value={COMPLETION_OPTIONS.find(option => option.value === selectedCompletion)}
                    placeholder="Select Grade"
                  />
                </div>
                <div style={{ width: '200px' }}>
                  <Select
                    id="status-filter"
                    options={PASSED_OPTIONS}
                    onChange={handleIsPassedChange}
                    value={PASSED_OPTIONS.find(option => option.value === selectedPassed)}
                    placeholder="Select Status"
                  />
                </div>
              </div>
            }
            columns={HistoryReadingColumns}
            data={data}
             onSearch={(searchTerm: string) => {
              setSearchTerm(searchTerm);
              setCurrentPage(1);
              handleParamsChange(1, searchTerm, pageSize, selectedCompletion, selectedPassed,);
            }}
            endpoint={ENDPOINT.STUDENT}
            isCreatable={false}
            isEditable={false}
            isImportable={false}
            isDeletable={false}
            trueLabel="Active"
            falseLabel="Inactive"
            // customActions={[{
            //   action: "View question",
            //   link: (row) => buildRoute(ROUTES.QUESTIONS, { id: row.id }),
            // }]}
          />
          <Pagination
            pageSize={pageSize}
            numOfRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={(page: number) => {
              setCurrentPage(page);
              handleParamsChange(page, searchTerm, pageSize, selectedCompletion,selectedPassed);
            }}
            onPageSizeChange={handlePageResize}
            totalPage={totalPages}
          />

         
        </div>
      </main>
      <NotifyModal
        showModal={showNotiModal}
        onClose={() => setShowNotiModal(false)}
        title={""}      
        content={""}
        student_id={Number(studentId)}
      />
    </>
  )
}

export default DetailStudent;