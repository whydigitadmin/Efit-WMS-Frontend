import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import {
  Avatar,
  ButtonBase,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  FormHelperText,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CommonListViewTable from './CommonListViewTable';
import axios from 'axios';
import { useRef, useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showErrorToast, showSuccessToast } from 'utils/toastUtils';
import { getAllActiveCountries } from 'utils/CommonFunctions';

export const StateMaster = () => {
  const [orgId, setOrgId] = useState(1000000001);
  const [loginUserName, setLoginUserName] = useState('Karupu');
  const [formData, setFormData] = useState({
    active: true,
    stateCode: '',
    stateNo: '',
    stateName: '',
    country: ''
  });
  const [editId, setEditId] = useState('');
  const [countryList, setCountryList] = useState([]);

  const theme = useTheme();
  const anchorRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({
    stateCode: '',
    stateNo: '',
    stateName: '',
    country: ''
  });
  const [listView, setListView] = useState(false);
  const listViewColumns = [
    { accessorKey: 'stateCode', header: 'State Code', size: 140 },
    { accessorKey: 'stateNumber', header: 'State No', size: 140 },
    { accessorKey: 'stateName', header: 'State Name', size: 140 },
    { accessorKey: 'country', header: 'Country', size: 140 },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];
  const [listViewData, setListViewData] = useState([]);

  useEffect(() => {
    getAllStates();

    const fetchData = async () => {
      try {
        const countryData = await getAllActiveCountries(orgId);
        setCountryList(countryData);
      } catch (error) {
        console.error('Error fetching country data:', error);
      }
    };
    fetchData();
  }, []);

  const getAllStates = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/commonmaster/state?orgid=${orgId}`);
      if (response.status === 200) {
        setListViewData(response.data.paramObjectsMap.stateVO);
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getStateById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/commonmaster/state/${row.original.id}`);
      if (response.status === 200) {
        setListView(false);
        const particularState = response.data.paramObjectsMap.stateVO;

        setFormData({
          stateCode: particularState.stateCode,
          stateNo: particularState.stateNumber,
          stateName: particularState.stateName,
          country: particularState.country,
          active: particularState.active === 'Active' ? true : false
        });
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const codeRegex = /^[a-zA-Z0-9#_\-\/\\]*$/;
    const nameRegex = /^[A-Za-z ]*$/;
    const numericRegex = /^[0-9]*$/;

    if (name === 'stateCode' && !codeRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else if (name === 'stateCode' && value.length > 3) {
      setFieldErrors({ ...fieldErrors, [name]: 'Max Lenght is 3' });
    } else if (name === 'stateNo' && !numericRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else if (name === 'stateNo' && value.length > 3) {
      setFieldErrors({ ...fieldErrors, [name]: 'Max Lenght is 3' });
    } else if (name === 'stateName' && !nameRegex.test(value)) {
      setFieldErrors({ ...fieldErrors, [name]: 'Invalid Format' });
    } else {
      setFormData({ ...formData, [name]: value.toUpperCase() });
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleClear = () => {
    setFormData({
      stateCode: '',
      stateNo: '',
      stateName: '',
      country: '',
      active: true
    });
    setFieldErrors({
      stateCode: '',
      stateNo: '',
      stateName: '',
      country: ''
    });
  };

  const handleSave = () => {
    const errors = {};
    if (!formData.stateCode) {
      errors.stateCode = 'State Code is required';
    }
    if (!formData.stateNo) {
      errors.stateNo = 'State No is required';
    }
    if (!formData.stateName) {
      errors.stateName = 'State Name is required';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }

    if (Object.keys(errors).length === 0) {
      const saveFormData = {
        ...(editId && { id: editId }),
        active: formData.active,
        stateCode: formData.stateCode,
        stateNumber: formData.stateNo,
        stateName: formData.stateName,
        region: '',
        country: formData.country,
        orgId: orgId,
        createdby: loginUserName
      };

      axios
        .post(`${process.env.REACT_APP_API_URL}/api/commonmaster/state`, saveFormData)
        .then((response) => {
          if (response.data.statusFlag === 'Error') {
            showErrorToast(response.data.paramObjectsMap.errorMessage);
          } else {
            showSuccessToast(response.data.paramObjectsMap.message);
            handleClear();
            getAllStates();
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          showErrorToast('An error occurred while saving the state');
        });
    } else {
      setFieldErrors(errors);
    }
  };

  const handleView = () => {
    setListView(!listView);
  };

  const handleCheckboxChange = (event) => {
    setFormData({
      ...formData,
      active: event.target.checked
    });
  };

  return (
    <div className="card w-full p-6 bg-base-100 shadow-xl" style={{ padding: '20px', borderRadius: '10px' }}>
      <div className="row d-flex ml">
        <div className="d-flex flex-wrap justify-content-start mb-4" style={{ marginBottom: '20px' }}>
          <Tooltip title="Search" placement="top">
            <ButtonBase sx={{ borderRadius: '12px', marginRight: '10px' }}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .2s ease-in-out',
                  background: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  '&[aria-controls="menu-list-grow"],&:hover': {
                    background: theme.palette.secondary.dark,
                    color: theme.palette.secondary.light
                  }
                }}
                ref={anchorRef}
                aria-haspopup="true"
                color="inherit"
              >
                <SearchIcon size="1.3rem" stroke={1.5} />
              </Avatar>
            </ButtonBase>
          </Tooltip>

          <Tooltip title="Clear" placement="top">
            {' '}
            <ButtonBase sx={{ borderRadius: '12px', marginRight: '10px' }} onClick={handleClear}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .2s ease-in-out',
                  background: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  '&[aria-controls="menu-list-grow"],&:hover': {
                    background: theme.palette.secondary.dark,
                    color: theme.palette.secondary.light
                  }
                }}
                ref={anchorRef}
                aria-haspopup="true"
                color="inherit"
              >
                <ClearIcon size="1.3rem" stroke={1.5} />
              </Avatar>
            </ButtonBase>
          </Tooltip>

          <Tooltip title="List View" placement="top">
            {' '}
            <ButtonBase sx={{ borderRadius: '12px' }} onClick={handleView}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .2s ease-in-out',
                  background: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  '&[aria-controls="menu-list-grow"],&:hover': {
                    background: theme.palette.secondary.dark,
                    color: theme.palette.secondary.light
                  }
                }}
                ref={anchorRef}
                aria-haspopup="true"
                color="inherit"
              >
                <FormatListBulletedTwoToneIcon size="1.3rem" stroke={1.5} />
              </Avatar>
            </ButtonBase>
          </Tooltip>
          <Tooltip title="Save" placement="top">
            {' '}
            <ButtonBase sx={{ borderRadius: '12px', marginLeft: '10px' }} onClick={handleSave}>
              <Avatar
                variant="rounded"
                sx={{
                  ...theme.typography.commonAvatar,
                  ...theme.typography.mediumAvatar,
                  transition: 'all .2s ease-in-out',
                  background: theme.palette.secondary.light,
                  color: theme.palette.secondary.dark,
                  '&[aria-controls="menu-list-grow"],&:hover': {
                    background: theme.palette.secondary.dark,
                    color: theme.palette.secondary.light
                  }
                }}
                ref={anchorRef}
                aria-haspopup="true"
                color="inherit"
              >
                <SaveIcon size="1.3rem" stroke={1.5} />
              </Avatar>
            </ButtonBase>
          </Tooltip>
        </div>
      </div>

      {listView ? (
        <div className="mt-4">
          <CommonListViewTable
            data={listViewData}
            columns={listViewColumns}
            blockEdit={true} // DISAPLE THE MODAL IF TRUE
            toEdit={getStateById}
          />
        </div>
      ) : (
        <div className="row">
          <div className="col-md-3 mb-3">
            <TextField
              label="State Number"
              variant="outlined"
              size="small"
              fullWidth
              name="stateNo"
              value={formData.stateNo}
              onChange={handleInputChange}
              error={!!fieldErrors.stateNo}
              helperText={fieldErrors.stateNo}
            />
          </div>
          <div className="col-md-3 mb-3">
            <TextField
              label="State Code"
              variant="outlined"
              size="small"
              fullWidth
              name="stateCode"
              value={formData.stateCode}
              onChange={handleInputChange}
              error={!!fieldErrors.stateCode}
              helperText={fieldErrors.stateCode}
            />
          </div>
          <div className="col-md-3 mb-3">
            <TextField
              label="State Name"
              variant="outlined"
              size="small"
              fullWidth
              name="stateName"
              value={formData.stateName}
              onChange={handleInputChange}
              error={!!fieldErrors.stateName}
              helperText={fieldErrors.stateName}
            />
          </div>
          <div className="col-md-3 mb-3">
            <FormControl variant="outlined" size="small" fullWidth error={!!fieldErrors.country}>
              <InputLabel id="country-label">Country</InputLabel>
              <Select labelId="country-label" label="Country" value={formData.country} onChange={handleInputChange} name="country">
                {countryList.map((row) => (
                  <MenuItem key={row.id} value={row.countryName}>
                    {row.countryName}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.country && <FormHelperText>{fieldErrors.country}</FormHelperText>}
            </FormControl>
          </div>
          <div className="col-md-3 mb-3">
            <FormControlLabel
              control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} />}
              label="Active"
              labelPlacement="end"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StateMaster;
