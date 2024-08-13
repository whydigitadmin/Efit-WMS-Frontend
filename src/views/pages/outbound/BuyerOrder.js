import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { FormHelperText } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import CommonListViewTable from '../basic-masters/CommonListViewTable';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ActionButton from 'utils/ActionButton';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import { getAllActiveBranches } from 'utils/CommonFunctions';

export const BuyerOrder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [branchList, setBranchList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [loginUserId, setLoginUserId] = useState(localStorage.getItem('userId'));
  const [loginBranchCode, setLoginBranchCode] = useState(localStorage.getItem('branchCode'));
  const [loginBranch, setLoginBranch] = useState(localStorage.getItem('branch'));
  const [loginCustomer, setLoginCustomer] = useState(localStorage.getItem('customer'));
  const [loginClient, setLoginClient] = useState(localStorage.getItem('client'));
  const [loginWarehouse, setLoginWarehouse] = useState(localStorage.getItem('warehouse'));

  const [formData, setFormData] = useState({
    billto: '',
    branch: loginBranch,
    branchCode: loginBranchCode,
    buyerShortName: '',
    client: loginClient,
    company: '',
    createdBy: loginUserName,
    currency: '',
    customer: loginCustomer,
    docDate: null,
    exRate: '',
    finYear: '',
    freeze: true,
    invoiceDate: null,
    invoiceNo: '',
    location: '',
    orderDate: null,
    orderNo: '',
    orgId: orgId,
    reMarks: '',
    refDate: null,
    refNo: '',
    shipTo: ''
  });
  const [value, setValue] = useState(0);

  const [skuDetailsTableData, setSkuDetailsTableData] = useState([
    {
      id: 1,
      availQty: '',
      batchNo: '',
      partDesc: '',
      partNo: '',
      qcflag: '',
      qty: '',
      remarks: '',
      sku: ''
    }
  ]);

  useEffect(() => {
    getAllCurrencies();
    getAllBranches();
    getAllBuyerOrderByOrgId();
  }, []);

  const handleAddRow = () => {
    if (isLastRowEmpty(skuDetailsTableData)) {
      displayRowError(skuDetailsTableData);
      return;
    }
    const newRow = {
      id: Date.now(),
      availQty: '',
      batchNo: '',
      partDesc: '',
      partNo: '',
      qcflag: '',
      qty: '',
      remarks: '',
      sku: ''
    };
    setSkuDetailsTableData([...skuDetailsTableData, newRow]);
    setSkuDetailsTableErrors([
      ...skuDetailsTableErrors,
      {
        availQty: '',
        batchNo: '',
        partDesc: '',
        partNo: '',
        qcflag: '',
        qty: '',
        remarks: '',
        sku: ''
      }
    ]);
  };

  const [skuDetailsTableErrors, setSkuDetailsTableErrors] = useState([
    {
      availQty: '',
      batchNo: '',
      partDesc: '',
      partNo: '',
      qcflag: '',
      qty: '',
      remarks: '',
      sku: ''
    }
  ]);

  const [fieldErrors, setFieldErrors] = useState({
    billto: '',
    branch: '',
    branchCode: '',
    buyerShortName: '',
    client: '',
    company: '',
    createdBy: '',
    currency: '',
    customer: '',
    docDate: '',
    exRate: '',
    finYear: '',
    freeze: true,
    invoiceDate: '',
    invoiceNo: '',
    location: '',
    orderDate: '',
    orderNo: '',
    orgId: orgId,
    reMarks: '',
    refDate: '',
    refNo: '',
    shipTo: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'id', header: 'Doc Id', size: 140 },
    { accessorKey: 'docDate', header: 'Doc Date', size: 140 },
    { accessorKey: 'orderNo', header: 'Order No', size: 140 },
    { accessorKey: 'orderDate', header: 'Order Date', size: 140 },
    { accessorKey: 'invoiceNo', header: 'Invoice No', size: 140 },
    { accessorKey: 'invoiceDate', header: 'Invoice Date', size: 140 },
    { accessorKey: 'buyerShortName', header: 'Buyer Short Name', size: 140 },
    { accessorKey: 'currency', header: 'Currency', size: 140 },
    { accessorKey: 'exRate', header: 'Ex Rate', size: 140 },
    { accessorKey: 'billto', header: 'Bill To', size: 140 },
    { accessorKey: 'refNo', header: 'Ref No', size: 140 },
    { accessorKey: 'refDate', header: 'Ref Date', size: 140 },
    { accessorKey: 'refDate', header: 'Ship To', size: 140 },
    { accessorKey: 'reMarks', header: 'Remarks', size: 140 }
  ];

  const [listViewData, setListViewData] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getAllCurrencies = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/currency?orgid=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setCurrencyList(response.paramObjectsMap.currencyVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllBranches = async () => {
    try {
      const branchData = await getAllActiveBranches(orgId);
      setBranchList(branchData);
    } catch (error) {
      console.error('Error fetching country data:', error);
    }
  };
  const getAllBuyerOrderByOrgId = async () => {
    try {
      const response = await apiCalls('get', `outward/getAllBuyerOrderByOrgId?orgId=${orgId}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListViewData(response.paramObjectsMap.buyerOrderVO);
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getAllBuyerOrderById = async (row) => {
    console.log('THE SELECTED EMPLOYEE ID IS:', row.original.id);
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `outward/getAllBuyerOrderById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response.status === true) {
        setListView(false);
        const particularBuyerOrder = response.paramObjectsMap.buyerOrderVO;
        console.log('THE PARTICULAR BUYER ORDER IS:', particularBuyerOrder);

        setFormData({
          docId: particularBuyerOrder.id,
          docDate: particularBuyerOrder.docDate,
          orderNo: particularBuyerOrder.orderNo,
          orderDate: particularBuyerOrder.orderDate,
          invoiceNo: particularBuyerOrder.invoiceNo,
          invoiceDate: particularBuyerOrder.invoiceDate,
          buyerShortName: particularBuyerOrder.buyerShortName,
          currency: particularBuyerOrder.currency,
          exRate: particularBuyerOrder.exRate,
          billto: particularBuyerOrder.billto,
          refNo: particularBuyerOrder.refNo,
          refDate: particularBuyerOrder.refDate,
          refDate: particularBuyerOrder.refDate,
          reMarks: particularBuyerOrder.reMarks
        });
        setSkuDetailsTableData(
          particularBuyerOrder.buyerOrderDetailsDTO.map((bo) => ({
            id: bo.id,
            partNo: bo.partNo,
            partDesc: bo.partDesc,
            batchNo: bo.batchNo,
            qty: bo.qty
          }))
        );
      } else {
        console.error('API Error:', response);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    const nameRegex = /^[A-Za-z ]*$/;
    const alphaNumericRegex = /^[A-Za-z0-9]*$/;
    const numericRegex = /^[0-9]*$/;
    const branchNameRegex = /^[A-Za-z0-9@_\-*]*$/;
    const branchCodeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;

    let errorMessage = '';

    switch (name) {
      case 'id':
      case 'shortName':
        if (!nameRegex.test(value)) {
          errorMessage = 'Only alphabetic characters are allowed';
        }
        break;
      case 'pan':
        if (!alphaNumericRegex.test(value)) {
          errorMessage = 'Only alphanumeric characters are allowed';
        } else if (value.length > 10) {
          errorMessage = 'Invalid Format';
        }
        break;
      case 'branchName':
        if (!branchNameRegex.test(value)) {
          errorMessage = 'Only alphanumeric characters and @, _, -, * are allowed';
        }
        break;
      case 'mobile':
        if (!numericRegex.test(value)) {
          errorMessage = 'Only numeric characters are allowed';
        } else if (value.length > 10) {
          errorMessage = 'Invalid Format';
        }
        break;
      default:
        break;
    }

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    } else {
      if (name === 'active') {
        setFormData({ ...formData, [name]: checked });
      } else if (name === 'email') {
        setFormData({ ...formData, [name]: value });
      } else {
        setFormData({ ...formData, [name]: value.toUpperCase() });
      }

      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleDeleteRow = (id) => {
    setSkuDetailsTableData(skuDetailsTableData.filter((row) => row.id !== id));
  };

  const isLastRowEmpty = (table) => {
    const lastRow = table[table.length - 1];
    if (!lastRow) return false;

    if (table === skuDetailsTableData) {
      return !lastRow.partNo || !lastRow.partDesc || !lastRow.batchNo || !lastRow.qty;
    }
    return false;
  };

  const displayRowError = (table) => {
    if (table === skuDetailsTableData) {
      setSkuDetailsTableErrors((prevErrors) => {
        const newErrors = [...prevErrors];
        newErrors[table.length - 1] = {
          ...newErrors[table.length - 1],
          partNo: !table[table.length - 1].partNo ? 'Part No is required' : '',
          partDesc: !table[table.length - 1].partDesc ? 'Part Desc is required' : '',
          // batchNo: !table[table.length - 1].batchNo ? 'Batch No is required' : '',
          qty: !table[table.length - 1].qty ? 'Qty is required' : ''
        };
        return newErrors;
      });
    }
  };
  const handleKeyDown = (e, row) => {
    if (e.key === 'Tab' && row.id === skuDetailsTableData[skuDetailsTableData.length - 1].id) {
      handleAddRow();
    }
  };

  const handleDateChange = (field, date) => {
    const formattedDate = dayjs(date).format('DD-MM-YYYY');
    setFormData((prevData) => ({ ...prevData, [field]: formattedDate }));
  };

  const handleClear = () => {
    setFormData({
      billto: '',
      branch: '',
      branchCode: '',
      buyerShortName: '',
      client: '',
      company: '',
      createdBy: '',
      currency: '',
      customer: '',
      docDate: null,
      exRate: '',
      finYear: '',
      freeze: true,
      invoiceDate: null,
      invoiceNo: '',
      location: '',
      orderDate: null,
      orderNo: '',
      orgId: orgId,
      reMarks: '',
      refDate: null,
      refNo: '',
      shipTo: ''
    });
    setSkuDetailsTableData([{ id: 1, availQty: '', batchNo: '', partDesc: '', partNo: '', qcflag: '', qty: '', remarks: '', sku: '' }]);
    setFieldErrors({
      billto: '',
      branch: '',
      branchCode: '',
      buyerShortName: '',
      client: '',
      company: '',
      createdBy: '',
      currency: '',
      customer: '',
      docDate: null,
      exRate: '',
      finYear: '',
      freeze: true,
      invoiceDate: null,
      invoiceNo: '',
      location: '',
      orderDate: null,
      orderNo: '',
      orgId: orgId,
      reMarks: '',
      refDate: null,
      refNo: '',
      shipTo: ''
    });
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.orderNo) {
      errors.orderNo = 'Order No is required';
    }
    if (!formData.orderDate) {
      errors.orderDate = 'Order Date is required';
    }
    if (!formData.invoiceNo) {
      errors.invoiceNo = 'Invoice No is required';
    }
    if (!formData.invoiceDate) {
      errors.invoiceDate = 'Invoice Date is required';
    }
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }
    if (!formData.exRate) {
      errors.exRate = 'Ex Rate is required';
    }

    let skuDetailsTableDataValid = true;
    const newTableErrors = skuDetailsTableData.map((row) => {
      const rowErrors = {};
      if (!row.partNo) {
        rowErrors.partNo = 'Part No is required';
        skuDetailsTableDataValid = false;
      }
      if (!row.partDesc) {
        rowErrors.partDesc = 'Part Desc is required';
        skuDetailsTableDataValid = false;
      }
      // if (!row.batchNo) {
      //   rowErrors.batchNo = 'Batch No is required';
      //   skuDetailsTableDataValid = false;
      // }
      if (!row.qty) {
        rowErrors.qty = 'Qty is required';
        skuDetailsTableDataValid = false;
      }

      return rowErrors;
    });
    // setFieldErrors(errors);

    setSkuDetailsTableErrors(newTableErrors);

    if (Object.keys(errors).length === 0) {
      setIsLoading(true);
      const buyerOrderDetailsDTO = skuDetailsTableData.map((row) => ({
        availQty: row.availQty,
        batchNo: row.batchNo,
        partDesc: row.partDesc,
        partNo: row.partNo,
        qcflag: row.qcflag,
        qty: row.qty,
        remarks: row.remarks,
        sku: row.sku
      }));

      const saveFormData = {
        ...(editId && { id: editId }),
        billto: formData.billto,
        branch: formData.branch,
        branchCode: formData.branchCode,
        buyerOrderDetailsDTO,
        buyerShortName: formData.buyerShortName,
        client: formData.client,
        company: formData.company,
        createdBy: formData.createdBy,
        currency: formData.currency,
        customer: formData.customer,
        docDate: formData.docDate,
        exRate: formData.exRate,
        finYear: formData.billto,
        freeze: formData.freeze,
        invoiceDate: formData.invoiceDate,
        invoiceNo: formData.invoiceNo,
        location: formData.location,
        orderDate: formData.orderDate,
        orderNo: formData.orderNo,
        orgId: orgId,
        reMarks: formData.reMarks,
        refDate: formData.refDate,
        refNo: formData.refNo,
        shipTo: formData.shipTo
      };

      console.log('DATA TO SAVE IS:', saveFormData);
      try {
        const response = await apiCalls('put', `warehousemastercontroller/createUpdateCustomer`, saveFormData);
        if (response.status === true) {
          console.log('Response:', response);
          handleClear();
          showToast('success', editId ? ' Customer Updated Successfully' : 'Customer created successfully');
          setIsLoading(false);
        } else {
          showToast('error', response.paramObjectsMap.errorMessage || 'Customer creation failed');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('error', 'Customer creation failed');
        setIsLoading(false);
      }
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleClose = () => {
    setFormData({
      customer: '',
      orderDate: '',
      pan: '',
      contactPerson: '',
      mobile: '',
      gstReg: '',
      email: '',
      groupOf: '',
      tanNo: '',
      address: '',
      country: '',
      state: '',
      city: '',
      gst: '',
      active: true
    });
  };

  return (
    <>
      <div>{/* <ToastContainer /> */}</div>
      <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
        <div className="row d-flex ml">
          <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
            <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
            <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
            <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
            <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={() => handleSave()} margin="0 10px 0 10px" />
          </div>
        </div>
        {listView ? (
          <div className="mt-4">
            <CommonListViewTable data={listViewData} columns={listViewColumns} blockEdit={true} toEdit={getAllBuyerOrderById} />
          </div>
        ) : (
          <>
            <div className="row">
              <div className="col-md-3 mb-3">
                <TextField
                  label="Doc Id"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="docId"
                  value={formData.docId}
                  onChange={handleInputChange}
                  error={!!fieldErrors.docId}
                  helperText={fieldErrors.docId}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Doc Date"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="docDate"
                  value={formData.docDate}
                  onChange={handleInputChange}
                  error={!!fieldErrors.docDate}
                  helperText={fieldErrors.docDate}
                  disabled
                />
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="Order No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="orderNo"
                  value={formData.orderNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.orderNo}
                  helperText={fieldErrors.orderNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Order Date"
                      value={formData.orderDate ? dayjs(formData.orderDate, 'DD-MM-YYYY') : null}
                      onChange={(date) => handleDateChange('orderDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD/MM/YYYY"
                      error={fieldErrors.orderDate}
                      helperText={fieldErrors.orderDate && 'Required'}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>

              <div className="col-md-3 mb-3">
                <TextField
                  label="Invoice No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="invoiceNo"
                  value={formData.invoiceNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.invoiceNo}
                  helperText={fieldErrors.invoiceNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Invoice Date"
                      value={formData.invoiceDate ? dayjs(formData.invoiceDate, 'DD-MM-YYYY') : null}
                      onChange={(date) => handleDateChange('invoiceDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD/MM/YYYY"
                      error={fieldErrors.invoiceDate}
                      helperText={fieldErrors.invoiceDate && 'Required'}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.buyerShortName}>
                  <InputLabel id="buyerShortName">Buyer Short Name</InputLabel>
                  <Select
                    labelId="buyerShortName"
                    id="buyerShortName"
                    name="buyerShortName"
                    label="Buyer Short Name"
                    value={formData.buyerShortName}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Select Option</MenuItem>
                    <MenuItem value="BUYERSHORTNAME1">Buyer Short Name1</MenuItem>
                    <MenuItem value="BUYERSHORTNAME2">Buyer Short Name2</MenuItem>
                  </Select>
                  {fieldErrors.buyerShortName && <FormHelperText error>{fieldErrors.buyerShortName}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Buyer Full Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="buyerFullName"
                  value={formData.buyerFullName}
                  error={!!fieldErrors.buyerFullName}
                  helperText={fieldErrors.buyerFullName}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.currency}>
                  <InputLabel id="currency">Currency</InputLabel>
                  <Select
                    labelId="currency"
                    id="currency"
                    name="currency"
                    label="Currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    {currencyList?.map((row) => (
                      <MenuItem key={row.id} value={row.currency}>
                        {row.currency}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.currency && <FormHelperText error>{fieldErrors.currency}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Ex. Rate"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="exRate"
                  value={formData.exRate}
                  onChange={handleInputChange}
                  error={!!fieldErrors.exRate}
                  // helperText={fieldErrors.exRate}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.billto}>
                  <InputLabel id="billto">Bill To</InputLabel>
                  <Select labelId="billto" id="billto" name="billto" label="Bill To" value={formData.billto} onChange={handleInputChange}>
                    <MenuItem value="BILLTO1">BILLTO 1</MenuItem>
                    <MenuItem value="BILLTO2">BILLTO 2</MenuItem>
                  </Select>
                  {fieldErrors.billto && <FormHelperText error>{fieldErrors.billto}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Bill To Full Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="billtoFullName"
                  value={formData.billtoFullName}
                  error={!!fieldErrors.billtoFullName}
                  helperText={fieldErrors.billtoFullName}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Ref No"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="refNo"
                  value={formData.refNo}
                  onChange={handleInputChange}
                  error={!!fieldErrors.refNo}
                  helperText={fieldErrors.refNo}
                />
              </div>
              <div className="col-md-3 mb-3">
                <FormControl fullWidth variant="filled" size="small">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Ref Date"
                      value={formData.refDate ? dayjs(formData.refDate, 'DD-MM-YYYY') : null}
                      onChange={(date) => handleDateChange('refDate', date)}
                      slotProps={{
                        textField: { size: 'small', clearable: true }
                      }}
                      format="DD/MM/YYYY"
                      error={fieldErrors.refDate}
                      helperText={fieldErrors.refDate && 'Required'}
                    />
                  </LocalizationProvider>
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <FormControl size="small" variant="outlined" fullWidth error={!!fieldErrors.shipTo}>
                  <InputLabel id="shipTo">Ship To</InputLabel>
                  <Select labelId="shipTo" id="shipTo" name="shipTo" label="Ship To" value={formData.shipTo} onChange={handleInputChange}>
                    <MenuItem value="SHIPTO1">SHIPTO1</MenuItem>
                    <MenuItem value="SHIPTO2">SHIPTO2</MenuItem>
                  </Select>
                  {fieldErrors.shipTo && <FormHelperText error>{fieldErrors.shipTo}</FormHelperText>}
                </FormControl>
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Ship To Full Name"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="shipToFullName"
                  value={formData.shipToFullName}
                  error={!!fieldErrors.shipToFullName}
                  helperText={fieldErrors.shipToFullName}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-3">
                <TextField
                  label="Remarks"
                  variant="outlined"
                  size="small"
                  fullWidth
                  name="reMarks"
                  value={formData.reMarks}
                  onChange={handleInputChange}
                  error={!!fieldErrors.reMarks}
                  helperText={fieldErrors.reMarks}
                />
              </div>
            </div>
            <div className="row mt-2">
              <Box sx={{ width: '100%' }}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="secondary"
                  indicatorColor="secondary"
                  aria-label="secondary tabs example"
                >
                  <Tab value={0} label="SKU Details" />
                  <Tab value={1} label="Summary" />
                </Tabs>
              </Box>
              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <>
                    <div className="row d-flex ml">
                      <div className="mb-1">
                        <ActionButton title="Add" icon={AddIcon} onClick={handleAddRow} />
                      </div>
                      {/* Table */}
                      <div className="row mt-2">
                        <div className="col-lg-12">
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead>
                                <tr style={{ backgroundColor: '#673AB7' }}>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '68px' }}>
                                    Action
                                  </th>
                                  <th className="px-2 py-2 text-white text-center" style={{ width: '50px' }}>
                                    S.No
                                  </th>
                                  <th className="px-2 py-2 text-white text-center">Part No *</th>
                                  <th className="px-2 py-2 text-white text-center">Part Desc</th>
                                  <th className="px-2 py-2 text-white text-center">Batch No</th>
                                  <th className="px-2 py-2 text-white text-center">Qty *</th>
                                  <th className="px-2 py-2 text-white text-center">Avl. Qty</th>
                                </tr>
                              </thead>
                              <tbody>
                                {skuDetailsTableData.map((row, index) => (
                                  <tr key={row.id}>
                                    <td className="border px-2 py-2 text-center">
                                      <ActionButton title="Delete" icon={DeleteIcon} onClick={() => handleDeleteRow(row.id)} />
                                    </td>
                                    <td className="text-center">
                                      <div className="pt-2">{index + 1}</div>
                                    </td>

                                    <td className="border px-2 py-2">
                                      <select
                                        value={row.partNo}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setSkuDetailsTableData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, partNo: value.toUpperCase() } : r))
                                          );
                                          setSkuDetailsTableErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              partNo: !value ? 'Part No is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={skuDetailsTableErrors[index]?.partNo ? 'error form-control' : 'form-control'}
                                      >
                                        <option value="">Select Option</option>
                                        <option value="KM18">KM18</option>
                                        <option value="KM19">KM19</option>
                                      </select>
                                      {skuDetailsTableErrors[index]?.partNo && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {skuDetailsTableErrors[index].partNo}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.partDesc}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setSkuDetailsTableData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, partDesc: value.toUpperCase() } : r))
                                          );
                                          setSkuDetailsTableErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], partDesc: !value ? 'Part Desc is required' : '' };
                                            return newErrors;
                                          });
                                        }}
                                        className={skuDetailsTableErrors[index]?.partDesc ? 'error form-control' : 'form-control'}
                                      />
                                      {skuDetailsTableErrors[index]?.partDesc && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {skuDetailsTableErrors[index].partDesc}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <select
                                        value={row.batchNo}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setSkuDetailsTableData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, batchNo: value.toUpperCase() } : r))
                                          );
                                          setSkuDetailsTableErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = {
                                              ...newErrors[index],
                                              batchNo: !value ? 'Batch No is required' : ''
                                            };
                                            return newErrors;
                                          });
                                        }}
                                        className={skuDetailsTableErrors[index]?.batchNo ? 'error form-control' : 'form-control'}
                                      >
                                        <option value="">Select Option</option>
                                        <option value="ONE">ONE</option>
                                        <option value="TWO">TWO</option>
                                      </select>
                                      {skuDetailsTableErrors[index]?.batchNo && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {skuDetailsTableErrors[index].batchNo}
                                        </div>
                                      )}
                                    </td>

                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.qty}
                                        onKeyDown={(e) => handleKeyDown(e, row)}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setSkuDetailsTableData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, qty: value.toUpperCase() } : r))
                                          );
                                          setSkuDetailsTableErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], qty: !value ? 'Qty is required' : '' };
                                            return newErrors;
                                          });
                                        }}
                                        className={skuDetailsTableErrors[index]?.qty ? 'error form-control' : 'form-control'}
                                      />
                                      {skuDetailsTableErrors[index]?.qty && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {skuDetailsTableErrors[index].qty}
                                        </div>
                                      )}
                                    </td>
                                    <td className="border px-2 py-2">
                                      <input
                                        type="text"
                                        value={row.availQty}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          setSkuDetailsTableData((prev) =>
                                            prev.map((r) => (r.id === row.id ? { ...r, availQty: value.toUpperCase() } : r))
                                          );
                                          setSkuDetailsTableErrors((prev) => {
                                            const newErrors = [...prev];
                                            newErrors[index] = { ...newErrors[index], availQty: !value ? 'Avail Qty is required' : '' };
                                            return newErrors;
                                          });
                                        }}
                                        className={skuDetailsTableErrors[index]?.availQty ? 'error form-control' : 'form-control'}
                                        disabled
                                      />
                                      {skuDetailsTableErrors[index]?.availQty && (
                                        <div className="mt-2" style={{ color: 'red', fontSize: '12px' }}>
                                          {skuDetailsTableErrors[index].availQty}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {value === 1 && (
                  <>
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <TextField
                          label="Order Qty"
                          variant="outlined"
                          size="small"
                          fullWidth
                          name="orderQty"
                          // value={formData.orderQty}
                          // onChange={handleInputChange}
                          // error={!!fieldErrors.orderQty}
                          // helperText={fieldErrors.orderQty}
                          disabled
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <TextField
                          label="Avl Qty"
                          variant="outlined"
                          size="small"
                          fullWidth
                          name="avlQty"
                          // value={formData.avlQty}
                          // onChange={handleInputChange}
                          // error={!!fieldErrors.avlQty}
                          // helperText={fieldErrors.avlQty}
                          disabled
                        />
                      </div>
                    </div>
                  </>
                )}
              </Box>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </>
  );
};
export default BuyerOrder;
