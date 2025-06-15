import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Toolbar,
  ListItemButton,
} from "@mui/material";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useLocation, useNavigate } from "react-router";

const navItems = [
  { label: "Scatter Plot", icon: <ScatterPlotIcon />, path: "/" },
  { label: "Tree View", icon: <AccountTreeIcon />, path: "/tree-view" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleDrawer = () => setIsCollapsed((isCollapsed) => !isCollapsed);

  return (
    <Drawer
      variant="permanent"
      sx={{
        "& .MuiDrawer-paper": {
          width: isCollapsed ? 60 : 250,
          transition: "width 0.3s",
          overflowX: "hidden",
          bgcolor: "background.default",
          border: "none",
          boxShadow:'rgba(0, 0, 0, 0.1) 0px 1px 2px 0px'
        },
      }}
    >
      <Toolbar
        disableGutters
        sx={{ display: "flex", justifyContent: isCollapsed ? "center" : "end" }}
      >
        <IconButton
          sx={{
            mr: Number(!isCollapsed),
            ":focus": { outline: "none" },
          }}
          onClick={toggleDrawer}
        >
          {isCollapsed ? <MenuIcon /> : <ArrowBackIosIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item, index) => (
          <ListItem sx={{ p: 0 }} key={index}>
            <ListItemButton
              aria-label="navlink"
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} sx={{ textWrap: "nowrap" }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
