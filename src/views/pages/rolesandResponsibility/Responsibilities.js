import ClearIcon from '@mui/icons-material/Clear';
import FormatListBulletedTwoToneIcon from '@mui/icons-material/FormatListBulletedTwoTone';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import {
  Avatar,
  Box,
  ButtonBase,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  FormHelperText
} from '@mui/material';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommonListViewTable from '../basic-masters/CommonListViewTable';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import ActionButton from 'utils/ActionButton';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const names = ['Dashboard', 'BasicMaster', 'Master', 'Transaction', 'AR-Receivable', 'AP-Payable'];

function getStyles(name, selectedScreens, theme) {
  return {
    fontWeight: selectedScreens.indexOf(name) === -1 ? theme.typography.fontWeightRegular : theme.typography.fontWeightMedium
  };
}

const Responsibilities = () => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [listView, setListView] = useState(false);
  const [listViewData, setListViewData] = useState([]);
  const [orgId, setOrgId] = useState(localStorage.getItem('orgId'));
  const [data, setData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [roleDataSelect, setRoleDataSelect] = useState([]);
  const [value, setValue] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [editId, setEditId] = useState('');
  const [screenList, setScreenList] = useState([]);
  const [loginUserName, setLoginUserName] = useState(localStorage.getItem('userName'));
  const [selectedScreens, setSelectedScreens] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    orgId: orgId,
    active: true
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: false
  });

  const columns = [
    { accessorKey: 'responsibility', header: 'Responsibility', size: 140 },
    {
      accessorKey: 'screensVO',
      header: 'Screens',
      Cell: ({ cell }) => {
        const screens = cell
          .getValue()
          .map((screen) => screen.screenName)
          .join(', ');
        return screens;
      }
    },
    { accessorKey: 'active', header: 'Active', size: 140 }
  ];

  useEffect(() => {
    getAllResponsibilities();
    // getRoleData();
    getAllScreens();
  }, [listView]);

  const handleClear = () => {
    setFormData({
      name: '',
      active: true
    });
    setSelectedScreens([]);
    setFieldErrors({
      name: false
    });
  };

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;

    // Convert the selected values into the required format
    const selectedScreens = typeof value === 'string' ? value.split(',') : value;
    const screenDTO = selectedScreens.map((screenName, index) => ({
      //   id: index, // Assuming you don't have actual ids for the screens
      screenName
    }));

    setSelectedScreens(selectedScreens);

    // Update the formData with the new screenDTO
    setFormData((prevFormData) => ({
      ...prevFormData,
      screenDTO
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    let newValue = value;
    newValue = newValue.toUpperCase();
    newValue = newValue.replace(/[^A-Z]/g, '');

    // Update the value of newValue instead of redeclaring it
    newValue = name === 'active' ? checked : newValue;

    setFormData({ ...formData, [name]: newValue });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleView = () => {
    setListView(!listView);
  };

  const getAllScreens = async () => {
    try {
      const result = await apiCalls('get', `commonmaster/allScreenNames`);
      setScreenList(result.paramObjectsMap.screenNamesVO);
      console.log('Test', result);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getAllResponsibilities = async () => {
    try {
      const response = await apiCalls('get', `auth/allResponsibilityByOrgId?orgId=${orgId}`);

      setListViewData(response.paramObjectsMap.responsibilityVO);
      console.log('Test', response);
    } catch (err) {
      console.log('error', err);
    }
  };

  const getResponsibilityById = async (row) => {
    setEditId(row.original.id);
    try {
      const response = await apiCalls('get', `auth/responsibilityById?id=${row.original.id}`);
      console.log('API Response:', response);

      if (response) {
        console.log('after success then data is:', response);

        const particularResponsibility = response.paramObjectsMap.responsibilityVO;
        const particularResScreens = particularResponsibility.screensVO.map((k) => k.screenName);
        setFormData({
          name: particularResponsibility.responsibility,
          active: particularResponsibility.active === 'Active' ? true : false
        });
        console.log('THE SCREEN VO DATA IS:', particularResScreens);
        setSelectedScreens(particularResScreens);

        setListView(false);
      } else {
        console.error('API Error:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSave = async () => {
    const errors = Object.keys(formData).reduce((acc, key) => {
      if (!formData[key]) {
        acc[key] = true;
      }
      return acc;
    }, {});

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return; // Prevent API call if there are errors
    }
    setIsLoading(false);
    const screenVo = selectedScreens.map((row) => ({
      screenName: row
    }));

    const saveFormData = {
      ...(editId && { id: editId }),
      active: formData.active,
      responsibility: formData.name,
      orgId: orgId,
      createdby: loginUserName,
      screensDTO: screenVo
    };
    console.log('PERSON NAMES:', selectedScreens);

    console.log('THE SAVE FORM DATA IS:', saveFormData);

    try {
      const response = await apiCalls('put', `auth/createUpdateResponsibility`, saveFormData);
      if (response.status === true) {
        console.log('Response:', response);
        showToast('success', editId ? ' Responsibility Updated Successfully' : 'Responsibility created successfully');
        handleClear();
        getAllResponsibilities();
        setIsLoading(false);
      } else {
        showToast('error', response.paramObjectsMap.errorMessage || 'Responsibility creation failed');
        setIsLoading(false);
      }
    } catch (err) {
      console.log('error', err);
      showToast('error', 'Responsibility creation failed');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <ToastContainer />
      </div>
      <div>
        <div>
          <Box sx={{ width: '100%', typography: 'body1' }}>
            <div className="d-flex flex-wrap justify-content-start mb-4">
              <ActionButton title="Search" icon={SearchIcon} onClick={() => console.log('Search Clicked')} />
              <ActionButton title="Clear" icon={ClearIcon} onClick={handleClear} />
              <ActionButton title="List View" icon={FormatListBulletedTwoToneIcon} onClick={handleView} />
              <ActionButton title="Save" icon={SaveIcon} isLoading={isLoading} onClick={handleSave} margin="0 10px 0 10px" />
            </div>
            {!listView ? (
              <div className="row d-flex">
                <div className="col-md-3 mb-3">
                  <TextField
                    label="Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                  />
                </div>
                {/* <div className="col-md-3 mb-3">
                  <FormControl sx={{ width: 215 }} size="small">
                    <InputLabel id="demo-multiple-chip-label">Screens</InputLabel>
                    <Select
                      labelId="demo-multiple-chip-label"
                      id="demo-multiple-chip"
                      multiple
                      value={selectedScreens}
                      onChange={handleChange}
                      input={<OutlinedInput id="select-multiple-chip" label="Screens" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                      error={!!fieldErrors.name}
                      helperText={fieldErrors.name}
                    >
                      {screenList.map((name, index) => (
                        <MenuItem key={index} value={name.screenName} style={getStyles(name, selectedScreens, theme)}>
                          {name.screenName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div> */}
                <div className="col-md-3 mb-3">
                  <FormControl sx={{ width: 215 }} size="small" error={!!fieldErrors.name}>
                    <InputLabel id="demo-multiple-chip-label">Screens</InputLabel>
                    <Select
                      labelId="demo-multiple-chip-label"
                      id="demo-multiple-chip"
                      multiple
                      value={selectedScreens}
                      onChange={handleChange}
                      input={<OutlinedInput id="select-multiple-chip" label="Screens" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {screenList.map((name, index) => (
                        <MenuItem key={index} value={name.screenName} style={getStyles(name, selectedScreens, theme)}>
                          {name.screenName}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.name && <FormHelperText>{fieldErrors.name}</FormHelperText>}
                  </FormControl>
                </div>

                <div className="col-md-3 mb-3">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.active}
                          onChange={handleInputChange}
                          name="active"
                          sx={{ '& .MuiSvgIcon-root': { color: '#5e35b1' } }}
                        />
                      }
                      label="Active"
                    />
                  </FormGroup>
                </div>
              </div>
            ) : (
              <CommonListViewTable
                data={listViewData}
                columns={columns}
                toEdit={getResponsibilityById}
                blockEdit={true} // DISAPLE THE MODAL IF TRUE
              />
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Responsibilities;