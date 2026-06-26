// import Avatar from "@mui/material/Avatar";
// import Box from "@mui/material/Box";
// import Chip from "@mui/material/Chip";
// import Paper from "@mui/material/Paper";
// import Stack from "@mui/material/Stack";
// import Typography from "@mui/material/Typography";

// import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
// import PersonIcon from "@mui/icons-material/Person";

// import type { EmployeeNode } from "../types";

// type DepartmentCardProps = {
//   department: EmployeeNode;
// };

// function DepartmentCard({ department }: DepartmentCardProps) {
//   return (
//     <Paper
//       elevation={2}
//       sx={{
//         width: 300,
//         borderRadius: 2,
//         overflow: "hidden",
//       }}
//     >
//       {/* Department Header */}
//       <Box
//         sx={{
//           px: 2,
//           py: 1,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           borderTop: `4px solid ${
//             department.departmentColor ?? "#1976d2"
//           }`,
//           borderBottom: "1px solid",
//           borderColor: "divider",
//         }}
//       >
//         <Typography
//           sx={{
//             fontWeight: 600,
//             color: department.departmentColor ?? "primary.main",
//           }}
//         >
//           {department.department}
//         </Typography>

//         <Chip
//           size="small"
//           label={department.teamCount}
//         />
//       </Box>

//       {/* Employee Details */}
//       <Stack
//         direction="row"
//         spacing={2}
//         sx={{
//           p: 2,
//         }}
//       >
//         <Avatar
//           sx={{
//             width: 56,
//             height: 56,
//           }}
//         >
//           <PersonIcon />
//         </Avatar>

//        <Box sx={{ flex: 1 }}>
//           <Typography
//             sx={{
//               fontSize: 15,
//               color: "primary.main",
//               fontWeight: 600,
//             }}
//           >
//             {department.designation}
//           </Typography>

//           <Typography
//             sx={{
//               fontSize: 18,
//               fontWeight: 700,
//               mt: 0.5,
//             }}
//           >
//             {department.name}
//           </Typography>

//           <Typography
//             color="text.secondary"
//             sx={{
//               mt: 1,
//               fontSize: 13,
//             }}
//           >
//             Skills: {department.skills}
//           </Typography>

//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "flex-end",
//               mt: 2,
//             }}
//           >
//             <Chip
//               size="small"
//               icon={<GroupsOutlinedIcon />}
//               label={department.teamCount}
//             />
//           </Box>
//         </Box>
//       </Stack>
//     </Paper>
//   );
// }

// export default DepartmentCard;