import React, { useState, useEffect } from "react";
import {
  Pane,
  Heading,
  Button,
  SelectMenu,
  Dialog,
  TextInput,
} from "evergreen-ui";
import { useTheme } from "../App"; // Import ThemeContext
import Statistics from "../components/Statistics";
import TransactionsTable from "../components/TransactionsTable";
import EditSummaryDialog from "../components/EditSummaryDialog";
import ManageCategoriesDialog from "../components/ManageCategoriesDialog";
import PieChart from "../components/PieChart";

const API_BASE_URL = "http://localhost:5000/semesters"; // Update with your actual API base URL
const TRANSACTIONS_API_BASE_URL = "http://localhost:5000/transactions"; // Transactions API base URL

const HomePage = () => {
  const { theme } = useTheme(); // Access the current theme

  // Define dynamic styles based on the theme
  const dynamicStyles = {
    backgroundColor: theme === "light" ? "#ffffff" : "#121212",
    textColor: theme === "light" ? "#000000" : "#e0e0e0",
    buttonBackground: theme === "light" ? "#007bff" : "#673ab7",
    buttonTextColor: theme === "light" ? "#ffffff" : "#e0e0e0",
    inputBackground: theme === "light" ? "#f9f9f9" : "#2e2e2e",
    inputTextColor: theme === "light" ? "#000000" : "#e0e0e0",
  };

  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [isNewSemesterDialogShown, setIsNewSemesterDialogShown] = useState(false);
  const [isDeleteSemesterDialogShown, setIsDeleteSemesterDialogShown] = useState(false);
  const [isEditDialogShown, setIsEditDialogShown] = useState(false);
  const [isCategoryDialogShown, setIsCategoryDialogShown] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState("");
  const [semesterData, setSemesterData] = useState({});
  const [categories, setCategories] = useState(["Dues", "Event", "Uncategorized"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState([]);

  const fetchSemesters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const data = await response.json();
      setSemesters(data);

      if (data.length > 0) {
        setSelectedSemester(data[0].id);
        setSemesterData(
          data.reduce((acc, semester) => {
            acc[semester.id] = semester;
            return acc;
          }, {})
        );
        fetchTransactions(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching semesters:", error);
    }
  };

  const fetchTransactions = async (semesterId) => {
    try {
      const response = await fetch(`${TRANSACTIONS_API_BASE_URL}/?semester_id=${semesterId}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleSelectSemester = (semesterId) => {
    setSelectedSemester(semesterId);
    fetchTransactions(semesterId);
  };

  const handleCreateNewSemester = async () => {
    if (!newSemesterName.trim()) return;

    const newSemester = {
      name: newSemesterName.trim(),
      date: new Date().toISOString().split("T")[0],
      starting_capital: 0,
      active_house_size: 0,
      insurance_cost: 0,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSemester),
      });

      if (response.ok) {
        const { data } = await response.json();
        setSemesters((prev) => [...prev, data]);
        setSemesterData((prevData) => ({ ...prevData, [data.id]: data }));
        setSelectedSemester(data.id);
        fetchTransactions(data.id);
        setNewSemesterName("");
        setIsNewSemesterDialogShown(false);
      } else {
        console.error("Failed to create semester");
      }
    } catch (error) {
      console.error("Error creating semester:", error);
    }
  };

  const handleDeleteSemester = async () => {
    if (!selectedSemester) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedSemester}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedSemesters = semesters.filter(
          (semester) => semester.id !== selectedSemester
        );

        setSemesters(updatedSemesters);
        const nextSemester = updatedSemesters.length > 0 ? updatedSemesters[0].id : null;
        setSelectedSemester(nextSemester);

        setSemesterData((prevData) => {
          const { [selectedSemester]: _, ...rest } = prevData; // Remove the selected semester
          return rest;
        });
        setTransactions([]);
        setIsDeleteSemesterDialogShown(false);
      } else {
        console.error("Failed to delete semester");
      }
    } catch (error) {
      console.error("Error deleting semester:", error);
    }
  };

  const filteredTransactions = transactions.filter((txn) =>
    Object.values(txn)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Pane
      padding={16}
      style={{
        backgroundColor: dynamicStyles.backgroundColor,
        color: dynamicStyles.textColor,
      }}
    >
      <Heading
        size={800}
        marginBottom={16}
        style={{ color: dynamicStyles.textColor }}
      >
        PHI DELTA SIGMA FINANCIAL DASHBOARD
      </Heading>
      <Pane display="flex" alignItems="center" gap={8}>
        <SelectMenu
          title="Select Semester"
          options={semesters.map((semester) => ({
            label: semester.name,
            value: semester.id,
          }))}
          selected={selectedSemester}
          onSelect={(item) => handleSelectSemester(item.value)}
        >
          <Button
            style={{
              backgroundColor: dynamicStyles.buttonBackground,
              color: dynamicStyles.buttonTextColor,
            }}
          >
            {selectedSemester
              ? semesters.find((sem) => sem.id === selectedSemester)?.name
              : "No Semesters Available"}
          </Button>
        </SelectMenu>
        <Button
          onClick={() => setIsEditDialogShown(true)}
          style={{
            backgroundColor: dynamicStyles.buttonBackground,
            color: dynamicStyles.buttonTextColor,
          }}
        >
          Edit Summary
        </Button>
        <Button
          onClick={() => setIsCategoryDialogShown(true)}
          style={{
            backgroundColor: dynamicStyles.buttonBackground,
            color: dynamicStyles.buttonTextColor,
          }}
        >
          Manage Categories
        </Button>
        <Button
          onClick={() => setIsNewSemesterDialogShown(true)}
          style={{
            backgroundColor: dynamicStyles.buttonBackground,
            color: dynamicStyles.buttonTextColor,
          }}
        >
          Create New Semester
        </Button>
        {selectedSemester && (
          <Button
            onClick={() => setIsDeleteSemesterDialogShown(true)}
            intent="danger"
          >
            Delete Semester
          </Button>
        )}
      </Pane>

      {selectedSemester && semesterData[selectedSemester] && (
        <>
          <Statistics
            startingCapital={
              semesterData[selectedSemester].starting_capital || 0
            }
            currentCapital={
              semesterData[selectedSemester].current_capital || 0
            }
            surplus={
              (semesterData[selectedSemester].current_capital || 0) -
              (semesterData[selectedSemester].starting_capital || 0)
            }
            activeHouseSize={
              semesterData[selectedSemester].active_house_size || 0
            }
            insurance={semesterData[selectedSemester].insurance_cost || 0}
            transactions={transactions || []}
            categories={categories}
          />

          <Pane marginTop={16}>
            <TextInput
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              width="100%"
              marginBottom={16}
              style={{
                backgroundColor: dynamicStyles.inputBackground,
                color: dynamicStyles.inputTextColor,
              }}
            />
            <TransactionsTable
              transactions={filteredTransactions || []}
              categories={categories}
              setSemesterData={(newTransactions) =>
                setSemesterData((prevData) => ({
                  ...prevData,
                  [selectedSemester]: {
                    ...prevData[selectedSemester],
                    transactions: newTransactions,
                  },
                }))
              }
            />
          </Pane>
        </>
      )}

      <EditSummaryDialog
        isShown={isEditDialogShown}
        onClose={() => setIsEditDialogShown(false)}
        semesterData={selectedSemester ? semesterData[selectedSemester] : {}}
        onSave={(updatedValues) => console.log("Save semester summary", updatedValues)}
      />
      <ManageCategoriesDialog
        isShown={isCategoryDialogShown}
        onClose={() => setIsCategoryDialogShown(false)}
        categories={categories}
        onAddCategory={(newCategory) => {
          if (!categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
          }
        }}
        onDeleteCategory={(category) => {
          if (category === "Uncategorized") return;
          setCategories(categories.filter((cat) => cat !== category));
        }}
      />

      <Dialog
        isShown={isNewSemesterDialogShown}
        title="Create New Semester"
        onCloseComplete={() => setIsNewSemesterDialogShown(false)}
        confirmLabel="Create"
        onConfirm={handleCreateNewSemester}
        style={{
          backgroundColor: dynamicStyles.backgroundColor,
          color: dynamicStyles.textColor,
        }}
      >
        <TextInput
          placeholder="Enter new semester name"
          value={newSemesterName}
          onChange={(e) => setNewSemesterName(e.target.value)}
          style={{
            backgroundColor: dynamicStyles.inputBackground,
            color: dynamicStyles.inputTextColor,
          }}
        />
      </Dialog>

      <Dialog
        isShown={isDeleteSemesterDialogShown}
        title="Delete Semester"
        onCloseComplete={() => setIsDeleteSemesterDialogShown(false)}
        confirmLabel="Delete"
        intent="danger"
        onConfirm={handleDeleteSemester}
      >
        Are you sure you want to delete the semester "{semesters.find(
          (sem) => sem.id === selectedSemester
        )?.name}"? This action cannot be undone.
      </Dialog>
    </Pane>
  );
};

export default HomePage;
