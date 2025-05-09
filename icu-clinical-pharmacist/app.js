// List of cases (static, since directory listing is not possible in static HTML)
const CASES = [
  // Add your case HTML files here, e.g. 'case1.html,', 'case2.html'
  'patient_4056_2023-09-07.html',
  'patient_4260_2024-02-04.html',
  'patient_11354_2024-10-02.html',
  'patient_133954_2024-09-05.html',
  'patient_133954_2025-09-05.html',
  'patient_169455_2023-10-19.html',
  'patient_171366_2024-09-05.html',
  'patient_175874_2024-03-17.html',
  'patient_180494_2023-03-02.html',
  'patient_204424_2024-09-17.html',
  'patient_204449_2023-05-16.html',
  'patient_205326_2023-10-01.html',
  'patient_237637_2024-09-05.html',
  'patient_267014_2024-09-10.html',
  'patient_292403_2023-03-02.html',
  'patient_322762_2023-11-09.html',
  'patient_322762_2023-11-12.html',
  'patient_330550_2024-09-17.html',
  'patient_352344_2024-01-21.html',
  'patient_413881_2023-10-19.html',
  'patient_459223_2023-05-11.html',
  'patient_595920_2023-12-10.html',
  'patient_657070_2023-09-17.html',
  'patient_830201_2024-03-21.html',
  'patient_989376_2024-09-05.html',
  'patient_989376_2025-09-05.html',
  'patient_1022127_2024-01-21.html',
  'patient_1081346_2023-05-11.html',
  'patient_1081457_2023-12-07.html',
  'patient_1085321_2023-05-16.html',
  'patient_1087265_2023-05-18.html',
  'patient_1089371_2023-11-09.html',
  'patient_1093170_2024-03-17.html',
  'patient_1093203_2023-09-05.html',
  'patient_1094465_2023-09-28.html',
  'patient_1097300_2023-09-03.html',
  'patient_1097823_2023-09-10.html',
  'patient_1097823_2023-09-14.html',
  'patient_1097823_2023-09-28.html',
  'patient_1098320_2023-09-17.html',
  'patient_1098334_2024-01-23.html',
  'patient_1098865_2023-10-01.html',
  'patient_1098865_2023-10-05.html',
  'patient_1098865_2023-10-08.html',
  'patient_1101587_2023-11-26.html',
  'patient_1102887_2023-12-10.html',
  'patient_1103411_2023-11-05.html',
  'patient_1103796_2024-01-22.html',
  'patient_1103796_2024-01-25.html',
  'patient_1106170_2023-12-21.html',
  'patient_1110163_2024-02-04.html',
  'patient_1110163_2024-02-06.html',
  'patient_1110767_2024-02-04.html',
  'patient_1113807_2024-03-17.html',
  'patient_1114426_2024-04-15.html',
  'patient_1115499_2024-04-18.html',
  'patient_1115837_2024-04-18.html',
  'patient_1116094_2024-04-28.html',
  'patient_1119345_2024-09-11.html',
  'patient_1126912_2024-09-29.html',
];

// Group cases by patient EMR number
function groupCasesByPatient(files) {
  const groups = {};

  files.forEach((file) => {
    // Extract EMR number and date from filename
    const match = file.match(/patient_(\d+)_(\d{4}-\d{2}-\d{2})\.html/);
    if (!match) return;

    const emr = match[1];
    const date = match[2];

    if (!groups[emr]) {
      groups[emr] = [];
    }
    groups[emr].push({
      filename: file,
      date: date,
    });
  });

  return groups;
}

function populateCasesList() {
  const list = document.getElementById('cases-list');
  list.innerHTML = '';

  const caseGroups = groupCasesByPatient(CASES);

  Object.entries(caseGroups).forEach(([emr, interventions]) => {
    // Create patient group container
    const groupDiv = document.createElement('div');
    groupDiv.className = 'patient-group';

    // Create header with EMR number and toggle
    const header = document.createElement('div');
    header.className = 'patient-header';
    header.innerHTML = `
      <span>Patient ${emr}</span>
      <span>${interventions.length} intervention(s) <i class="arrow">▼</i></span>
    `;

    // Create list of interventions
    const casesContainer = document.createElement('div');
    casesContainer.className = 'patient-cases';

    interventions.forEach((intervention) => {
      const caseItem = document.createElement('div');
      caseItem.className = 'case-item';

      const button = document.createElement('button');
      button.className = 'case-button';
      button.innerHTML = `
        <span>Intervention: ${intervention.date}</span>
        <i class="arrow">▼</i>
      `;

      const content = document.createElement('div');
      content.className = 'case-content';

      // Toggle content visibility
      button.onclick = () => {
        button.classList.toggle('active');
        content.classList.toggle('open');

        // Lazy load iframe only when opened
        if (
          content.classList.contains('open') &&
          !content.querySelector('iframe')
        ) {
          content.innerHTML = `<iframe class="case-iframe" src="cases/${intervention.filename}"></iframe>`;
        }
      };

      caseItem.appendChild(button);
      caseItem.appendChild(content);
      casesContainer.appendChild(caseItem);
    });

    // Toggle patient cases visibility
    header.onclick = () => {
      header.classList.toggle('active');
      casesContainer.classList.toggle('open');
    };

    groupDiv.appendChild(header);
    groupDiv.appendChild(casesContainer);
    list.appendChild(groupDiv);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateCasesList();
});
