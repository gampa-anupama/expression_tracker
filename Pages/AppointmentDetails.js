import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hospitalLogo from "../assets/totalsolutions.jpg";

// Helper function to load and process images
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = reject;
    img.src = url;
  });
};

const generateAppointmentPDF = async (appointment) => {
  try {
    const doc = new jsPDF();

    // Validate appointment data
    if (!appointment || !appointment.childName) {
      console.log(appointment);
      console.log(appointment.childName);
      doc.setFontSize(14);
      doc.text("No appointment data available", doc.internal.pageSize.width / 2, 20, {
        align: "center",
      });
      doc.output("dataurlnewwindow");
      return;
    }

    // Add hospital logo
    try {
      const logo = await loadImage(hospitalLogo);
      doc.addImage(logo, "PNG", 15, 10, 40, 20);
    } catch (e) {
      console.log("Failed to add logo:", e);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Hospital Logo", 15, 20);
    }

    // Hospital information
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      [
        `Total Solution - Barkatpura`,
        `3-4-495/B, 1st Floor, YMCA Near More Super Market, Hyderabad, Telangana 500027, IN`,
        "Phone: +91 88860 08697",
      ],
      15,
      35
    );

    // Header with styling - using the same color palette
    doc.setFillColor(197, 27, 28); // Same red color from reference
    doc.rect(2, 50, doc.internal.pageSize.width - 4, 25, "F");

    // Title - center-aligned
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // White text
    doc.setFont("helvetica", "bold");
    doc.text(
      "Appointment Details",
      doc.internal.pageSize.width / 2,
      65,
      { align: "center" }
    );

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Patient Information Section
    const infoBoxY = 85;
    const infoBoxHeight = 175; // Increased height for vertical layout
    doc.setFillColor(255, 220, 222); // Light pink from reference
    doc.roundedRect(
      10,
      infoBoxY,
      doc.internal.pageSize.width - 20,
      infoBoxHeight,
      3,
      3,
      "F"
    );

    // Section Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", 15, infoBoxY + 12);

    // Draw divider line
    const lineY1 = infoBoxY + 18;
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(15, lineY1, doc.internal.pageSize.width - 15, lineY1);

    // Vertical layout for patient details
    doc.setFontSize(11);
    const labelX = 25;
    const valueX = 80;
    const lineSpacing = 12;
    let currentY = infoBoxY + 30;

    // Helper function to add field-value pairs
    const addField = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, labelX, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(value || "N/A", valueX, currentY);
      currentY += lineSpacing;
    };

    // Add patient details in vertical format
    addField("Patient Name:", appointment.childName);
    addField("Parent Name:", appointment.parentName);
    addField("Doctor:", appointment.doctorName);
    addField("Centre:", appointment.centreName);
    addField("Date:", new Date(appointment.appointmentDate).toLocaleDateString());
    addField("Time:", appointment.appointmentTime);
    addField("Consultation Type:", appointment.consultationType);
    addField("Status:", appointment.status);
    // addField("Referred By:", appointment.referredBy || "N/A");
    doc.setFont("helvetica", "bold");
    doc.text("Child Concerns:", labelX, currentY);
    doc.setFont("helvetica", "normal");

    // Handle multiline text if concerns are long
    const concernsText = appointment.childConcerns || "N/A";
    const splitConcerns = doc.splitTextToSize(concernsText, doc.internal.pageSize.width - valueX - 15);
    doc.text(splitConcerns, valueX, currentY);

    // Adjust the current Y position based on the number of lines
    currentY += Math.max(splitConcerns.length * 5 + 5, lineSpacing);
    // Prescription section
    if (appointment.prescription && appointment.prescription.trim()) {
      const prescriptionY = infoBoxY + infoBoxHeight + 15;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Prescription", 15, prescriptionY);

      // Add decorative line under section title
      doc.setDrawColor(197, 27, 28);
      doc.setLineWidth(0.5);
      doc.line(15, prescriptionY + 5, 80, prescriptionY + 5);

      const prescriptionText = doc.splitTextToSize(
        appointment.prescription,
        doc.internal.pageSize.width - 40
      );

      autoTable(doc, {
        startY: prescriptionY + 10,
        head: [],
        body: [[prescriptionText]],
        theme: 'plain',
        styles: {
          fontSize: 11,
          cellPadding: 5,
          lineColor: [197, 28, 27],
          valign: "middle"
        },
        columnStyles: {
          0: { cellWidth: 180 }
        },
        tableLineColor: [197, 27, 28],
        tableLineWidth: 0.3,
        margin: { top: 5 }
      });
    }

    // Previous Medical Reports
    if (appointment.previousMedicalReports && appointment.previousMedicalReports.length > 0) {
      const tableY = appointment.prescription && appointment.prescription.trim()
        ? doc.previousAutoTable.finalY + 15
        : infoBoxY + infoBoxHeight + 15;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Previous Medical Reports", 15, tableY);

      // Add decorative line under section title
      doc.setDrawColor(197, 27, 28);
      doc.setLineWidth(0.5);
      doc.line(15, tableY + 5, 120, tableY + 5);

      const reportData = appointment.previousMedicalReports.map((report, index) => {
        return [`${index + 1}`, report];
      });

      autoTable(doc, {
        startY: tableY + 10,
        head: [['No.', 'Report Details']],
        body: reportData,
        styles: {
          fontSize: 11,
          cellPadding: 5,
          lineColor: [197, 28, 27],
          valign: "middle"
        },
        headStyles: {
          fillColor: [197, 27, 28],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center"
        },
        alternateRowStyles: {
          fillColor: [255, 193, 195],
        },
        columnStyles: {
          0: { cellWidth: 20, halign: "center" },
          1: { cellWidth: 160 }
        },
        margin: { top: 5 }
      });
    }

    // Add professional footer
    const footerY = doc.internal.pageSize.height - 20;
    doc.setDrawColor(197, 27, 28);
    doc.setLineWidth(0.5);
    doc.line(10, footerY, doc.internal.pageSize.width - 10, footerY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      doc.internal.pageSize.width - 15,
      doc.internal.pageSize.height - 10,
      { align: "right" }
    );
    doc.text(
      "Confidential Medical Document",
      15,
      doc.internal.pageSize.height - 10
    );

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (error) {
    console.log("Error generating appointment PDF:", error);
    alert("Failed to generate appointment PDF");
  }
};

export default generateAppointmentPDF;