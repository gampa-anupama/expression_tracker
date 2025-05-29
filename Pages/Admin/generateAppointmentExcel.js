// Note: This assumes SheetJS is already installed in the project
// If not, you'll need to run: npm install xlsx
import * as XLSX from 'xlsx';

/**
 * Generates an Excel file with appointment data and charts
 * @param {Array} appointmentsData - Array of appointment objects
 * @returns {void} - Triggers file download
 */
export default function generateAppointmentExcel(appointmentsData) {
  // Clone the data to avoid mutating the original
  const data = JSON.parse(JSON.stringify(appointmentsData));
  
  // Format the data for Excel
  const formattedData = data.map(appointment => ({
    'Child Name': appointment.childName,
    'Age': appointment.age,
    'Appointment Date': appointment.appointmentDateFormatted,
    'Appointment Time': appointment.appointmentTime,
    'Consultation Type': appointment.consultationType,
    'Doctor Name': appointment.doctorName,
    'Status': appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1),
    'Parent Name': appointment.parentName,
    'Centre': appointment.centreName
  }));

  // Create workbook and worksheet for appointments data
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  
  // Add column widths
  const colWidths = [
    { wch: 20 }, // Child Name
    { wch: 5 },  // Age
    { wch: 15 }, // Appointment Date
    { wch: 15 }, // Appointment Time
    { wch: 20 }, // Consultation Type
    { wch: 20 }, // Doctor Name
    { wch: 10 }, // Status
    { wch: 20 }, // Parent Name
    { wch: 20 }  // Centre
  ];
  worksheet['!cols'] = colWidths;
  
  // Add the data worksheet
  XLSX.utils.book_append_sheet(workbook, worksheet, "Appointments");

  // Create summary data for charts
  
  // 1. Status summary
  const statusCounts = {};
  data.forEach(item => {
    const status = item.status.charAt(0).toUpperCase() + item.status.slice(1);
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    'Status': status,
    'Count': count
  }));
  
  // 2. Consultation type summary
  const typeCounts = {};
  data.forEach(item => {
    typeCounts[item.consultationType] = (typeCounts[item.consultationType] || 0) + 1;
  });
  
  const typeData = Object.entries(typeCounts).map(([type, count]) => ({
    'Consultation Type': type,
    'Count': count
  }));
  
  // 3. Doctor workload summary
  const doctorCounts = {};
  data.forEach(item => {
    if (item.doctorName !== 'Not assigned') {
      doctorCounts[item.doctorName] = (doctorCounts[item.doctorName] || 0) + 1;
    }
  });
  
  const doctorData = Object.entries(doctorCounts).map(([doctor, count]) => ({
    'Doctor': doctor,
    'Appointments': count
  }));
  
  // 4. Date summary (appointments per day)
  const dateCounts = {};
  data.forEach(item => {
    dateCounts[item.appointmentDateFormatted] = (dateCounts[item.appointmentDateFormatted] || 0) + 1;
  });
  
  const dateData = Object.entries(dateCounts)
    .sort((a, b) => {
      // Convert date strings to Date objects for comparison
      const dateA = new Date(a[0].split('/').reverse().join('-'));
      const dateB = new Date(b[0].split('/').reverse().join('-'));
      return dateA - dateB;
    })
    .map(([date, count]) => ({
      'Date': date,
      'Appointments': count
    }));

  // Add summary worksheets
  const statusSheet = XLSX.utils.json_to_sheet(statusData);
  const typeSheet = XLSX.utils.json_to_sheet(typeData);
  const doctorSheet = XLSX.utils.json_to_sheet(doctorData);
  const dateSheet = XLSX.utils.json_to_sheet(dateData);
  
  XLSX.utils.book_append_sheet(workbook, statusSheet, "Status Summary");
  XLSX.utils.book_append_sheet(workbook, typeSheet, "Type Summary");
  XLSX.utils.book_append_sheet(workbook, doctorSheet, "Doctor Workload");
  XLSX.utils.book_append_sheet(workbook, dateSheet, "Daily Appointments");
  
  // Add charts (will be added as references - the user needs Excel to view them)
  
  // For Status Summary sheet
  statusSheet["!charts"] = [{
    type: "pie",
    title: "Appointment Status Distribution",
    data: [
      {
        ref: "A2:A" + (statusData.length + 1), // Status labels (starting from A2)
        values: "B2:B" + (statusData.length + 1), // Count values (starting from B2)
        name: "Status"
      }
    ],
    position: { x: 0, y: 0, w: 500, h: 300 }
  }];
  
  // For Type Summary sheet
  typeSheet["!charts"] = [{
    type: "bar",
    title: "Consultation Types",
    data: [
      {
        ref: "A2:A" + (typeData.length + 1), // Consultation type labels
        values: "B2:B" + (typeData.length + 1), // Count values
        name: "Types"
      }
    ],
    position: { x: 0, y: 0, w: 500, h: 300 }
  }];
  
  // For Doctor Workload sheet
  doctorSheet["!charts"] = [{
    type: "bar",
    title: "Doctor Appointment Workload",
    data: [
      {
        ref: "A2:A" + (doctorData.length + 1), // Doctor labels
        values: "B2:B" + (doctorData.length + 1), // Count values
        name: "Appointments"
      }
    ],
    position: { x: 0, y: 0, w: 500, h: 300 }
  }];
  
  // For Daily Appointments sheet
  dateSheet["!charts"] = [{
    type: "line",
    title: "Appointments by Date",
    data: [
      {
        ref: "A2:A" + (dateData.length + 1), // Date labels
        values: "B2:B" + (dateData.length + 1), // Count values
        name: "Appointments"
      }
    ],
    position: { x: 0, y: 0, w: 500, h: 300 }
  }];
  
  // Generate the Excel file
  const currentDate = new Date().toISOString().split('T')[0];
  const fileName = `appointments_${currentDate}.xlsx`;
  
  // Generate the Excel file and trigger download
  XLSX.writeFile(workbook, fileName);
}