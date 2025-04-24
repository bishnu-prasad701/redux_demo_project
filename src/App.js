import "./App.css";
import {
  useGetUsersQuery,
  useUpdateUsersMutation,
  useDeleteUsersMutation,
  useCreateUsersMutation,
} from "./services/userApi";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Modal,
  Typography,
  Box,
  TextField,
} from "@mui/material";
import { Paper, IconButton, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import TablePagination from "@mui/material/TablePagination";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    address: {
      street: "",
      suite: "",
      city: "",
      zipcode: "",
    },
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [open, setOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      address: {
        street: user.address.street,
        suite: user.address.suite,
        city: user.address.city,
        zipcode: user.address.zipcode,
      },
    });
    setOpen(true);
    setSelectedUserId(user.id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { data, isloading, error } = useGetUsersQuery();
  const [addUser] = useCreateUsersMutation();
  const [updateUser] = useUpdateUsersMutation();
  const [deleteUser] = useDeleteUsersMutation();

  const handleSubmit = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Nmae is Required";
    if (!formData.username.trim()) errors.username = "Username is Required";
    if (!formData.email.trim()) {
      errors.email = "Email is Reuired";
    } else {
      const emailPattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$/;
      if (!emailPattern.test(formData.email)) {
        errors.email = " Enter Valid Email";
      }
    }
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    if (selectedUserId) {
      updateUser({ id: selectedUserId, ...formData })
        .unwrap()
        .then(() => {
          alert("User Updated");
          setOpen(false);
        });
    } else {
      addUser(formData)
        .unwrap()
        .then(() => {
          alert("User Added");
          setOpen(false);
        });
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure!");
    if (confirmDelete) {
      deleteUser(id)
        .unwrap()
        .then(() => alert("User Deleted"));
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);
    return () => {
      clearTimeout(delaySearch);
    };
  }, [search]);

  if (isloading) return <p>Loading...</p>;
  if (error) return <p>There was an error</p>;

  return (
    <div
      className="App"
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Paper
        sx={{
          width: "80%",
          maxWidth: "1000px",
          height: "fit-content",
          mt: 4,
          p: 2,
        }}
        elevation={3}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          {/* <h1 style={{ textAlign: "left", color: "#1976d2" }}>User List</h1> */}
          <Typography
            variant="h4"
            sx={{ color: "#1976d2", fontWeight: "bold" }}
          >
            User List
          </Typography>

          <div style={{ display: "flex", gap: "10px" }}>
            <TextField
              size="small"
              variant="outlined"
              // placeholder="Search"
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              // sx={{ width: "250px" }}
            />

            <Button
              variant="contained"
              onClick={() => {
                setOpen(true);
                setFormData({
                  name: "",
                  username: "",
                  email: "",
                  address: {
                    street: "",
                    suite: "",
                    city: "",
                    zipcode: "",
                  },
                });
                setSelectedUserId(null);
              }}
            >
              Add User
            </Button>
          </div>
        </div>

        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 3,
            overflow: "auto",
            height: "750px",
            width: "100%",
          }}
        >
          <Table sx={{ width: "100%" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}
                >
                  Sl No
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}
                >
                  Username
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}
                >
                  Address
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}
                >
                  Edit
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", fontSize: "1rem", color: "#fff" }}
                >
                  Delete
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                ?.filter(
                  (user) =>
                    user.name
                      .toLowerCase()
                      .includes(debouncedSearch.toLowerCase()) ||
                    user.username
                      .toLowerCase()
                      .includes(debouncedSearch.toLowerCase())
                )
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.address.street}, {user.address.suite},
                      {user.address.city}, {user.address.zipcode}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(user)}
                        sx={{ color: "#1976D2" }}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <DeleteIcon
                          onClick={() => handleDelete(user.id)}
                          sx={{ color: "red" }}
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[7, 10, 25]}
          component="div"
          count={data?.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setFormData({
            name: "",
            username: "",
            email: "",
            address: {
              street: "",
              suite: "",
              city: "",
              zipcode: "",
            },
          });
          setSelectedUserId(null);
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            {selectedUserId ? "Edit User" : "Add User"}
          </Typography>
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={!!selectedUserId}
              />
              <TextField
                fullWidth
                name="username"
                label="Username"
                variant="outlined"
                value={formData.username}
                onChange={handleChange}
                required
                error={!!formErrors.username}
                helperText={formErrors.username}
                disabled={!!selectedUserId}
              />
              <TextField
                fullWidth
                name="email"
                label="Email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                required
                error={!!formErrors.email}
                helperText={formErrors.email}
                pattern="^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,}$"
                disabled={!!selectedUserId}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Address
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  name="street"
                  label="Street"
                  variant="outlined"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                />
                <TextField
                  fullWidth
                  name="suite"
                  label="Suite"
                  variant="outlined"
                  value={formData.address.suite}
                  onChange={handleAddressChange}
                />
                <TextField
                  fullWidth
                  name="city"
                  label="City"
                  variant="outlined"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                />
                <TextField
                  fullWidth
                  name="zipcode"
                  label="Zipcode"
                  variant="outlined"
                  value={formData.address.zipcode}
                  onChange={handleAddressChange}
                />
              </Box>
            </Box>
            <Button variant="contained" onClick={handleSubmit}>
              {selectedUserId ? "Update" : "Submit"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
export default App;
