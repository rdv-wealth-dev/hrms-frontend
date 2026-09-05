import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Divider from "@mui/material/Divider";

import KpiCardsGrid from "../../../components/card/KpiCard";
import StatusChip from "../../../components/common/StatusChip";
import PrimaryButton from "../../../components/button/PrimaryButton";
import { PAYROLL_OVERVIEW_MOCK_DATA, type PayrollOverviewData } from "../mock/payroll-data";

interface DashboardContentProps {
  data?: PayrollOverviewData;
}

export function DashboardContent({ data = PAYROLL_OVERVIEW_MOCK_DATA }: DashboardContentProps) {
  const kpiItems = data?.kpiItems ?? [];
  const currentRun = data?.currentRun;
  const statutoryDueDates = data?.statutoryDueDates ?? [];
  const recentActivity = data?.recentActivity ?? [];

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
      {/* 1. Header Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            letterSpacing: "-0.3px",
          }}
        >
          Payroll Overview
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <StatusChip
            variant="outlined"
            label={`${data?.periodLabel ?? ""} · ${data?.periodStatus ?? ""}`.trim()}
            sx={{
              fontWeight: 700,
              fontSize: "0.8125rem",
              borderColor: "error.main",
              color: "error.main",
              backgroundColor: "transparent",
            }}
          />
        </Box>
      </Box>

      {/* 2. Top Metric Cards */}
      <KpiCardsGrid items={kpiItems} mb={3} />

      {/* 3. Main Two-Column Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Run Wizard Banner & Statutory Due Dates Table */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Run Continuation Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 1,
                }}
              >
                {currentRun?.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.6,
                  mb: 3,
                }}
              >
                {currentRun?.description}
              </Typography>

              <PrimaryButton>
                {currentRun?.buttonText ?? "Open Run Wizard →"}
              </PrimaryButton>
            </Paper>

            {/* Statutory Due Dates Card / Table */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontWeight: 700,
                  color: "text.secondary",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  fontSize: "0.75rem",
                  mb: 2,
                }}
              >
                Statutory Due Dates
              </Typography>

              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small" aria-label="statutory due dates table">
                  <TableBody>
                    {statutoryDueDates.map((item) => (
                      <TableRow
                        key={item?.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        <TableCell
                          sx={{
                            py: 1.75,
                            pl: 0,
                            fontWeight: 600,
                            color: "text.primary",
                            fontSize: "0.875rem",
                            borderBottomColor: "divider",
                          }}
                        >
                          {item?.title}
                        </TableCell>
                        <TableCell
                          sx={{
                            py: 1.75,
                            color: "text.secondary",
                            fontSize: "0.875rem",
                            borderBottomColor: "divider",
                          }}
                        >
                          {item?.dueDate}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 1.75,
                            pr: 0,
                            borderBottomColor: "divider",
                          }}
                        >
                          <StatusChip
                            variant="outlined"
                            label={item?.status}
                            sx={{
                              color: "text.secondary",
                              borderColor: "divider",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              height: 24,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Grid>

        {/* Right Column: Recent Activity Feed */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 2.5,
              }}
            >
              Recent Activity
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {recentActivity.map((activity, index) => (
                <Box key={activity?.id || index}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: "0.875rem",
                      lineHeight: 1.4,
                      mb: 0.5,
                    }}
                  >
                    {activity?.action}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "block",
                      fontSize: "0.75rem",
                    }}
                  >
                    {activity?.meta}
                  </Typography>

                  {index < recentActivity.length - 1 && (
                    <Divider sx={{ mt: 2, borderColor: "divider" }} />
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardContent;
