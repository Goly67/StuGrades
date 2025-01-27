let subjects = [];
    let currentQuarter = '1'; // Initially selecting the 1st quarter

    function saveToLocalStorage() {
        localStorage.setItem(`subjects_${currentQuarter}`, JSON.stringify(subjects));
    }

    function loadFromLocalStorage() {
        const savedSubjects = localStorage.getItem(`subjects_${currentQuarter}`);
        if (savedSubjects) {
            subjects = JSON.parse(savedSubjects);
        } else {
            subjects = [];
        }
        renderTable();
    }

    function processGrades() {
        const input = document.getElementById('grade-input').value;
        // Adjusted regex to capture subject name, and grades for all quarters
        const regex = /([\w\s\-\&\(\)]+)(?:\n.*?\u2022.*?\n)FIRST QUARTER\tSECOND QUARTER\tFINAL\n(\d+|\-)\n(\d+|\-)\n(\d+|\-)/gm;
        subjects = [];
        let match;

        while ((match = regex.exec(input)) !== null) {
            const subjectName = match[1].trim();
            const firstQuarter = match[2] === '-' ? null : parseInt(match[2]);
            const secondQuarter = match[3] === '-' ? null : parseInt(match[3]);
            const finalGrade = match[4] === '-' ? null : parseFloat(match[4]);

            subjects.push({
                name: subjectName,
                firstQuarter,
                secondQuarter,
                finalGrade,
            });
        }

        renderTable();
        saveToLocalStorage();
    }

    function addSubject() {
        const newSubject = { name: 'New Subject', firstQuarter: null, secondQuarter: null, finalGrade: null };
        subjects.push(newSubject);
        renderTable();
        saveToLocalStorage();
    }

    function deleteSubject(index) {
        subjects.splice(index, 1);
        renderTable();
        saveToLocalStorage();
    }

    function updateGrade(index, grade) {
        grade = grade.replace(/[^0-9]/g, '').slice(0, 2); // Restrict to numeric values, max 2 digits
        if (grade) {
            switch (currentQuarter) {
                case '1':
                    subjects[index].firstQuarter = Math.max(0, Math.min(100, parseInt(grade) || 0));
                    break;
                case '2':
                    subjects[index].secondQuarter = Math.max(0, Math.min(100, parseInt(grade) || 0));
                    break;
                case '3':
                    subjects[index].thirdQuarter = Math.max(0, Math.min(100, parseInt(grade) || 0));
                    break;
                case '4':
                    subjects[index].fourthQuarter = Math.max(0, Math.min(100, parseInt(grade) || 0));
                    break;
            }
        }
        saveToLocalStorage();
        renderTable();
    }

    function updateSubjectName(index, name) {
        subjects[index].name = name;
        renderTable();
        saveToLocalStorage();
    }

    function renderTable() {
        const tbody = document.querySelector('#grades-table tbody');
        tbody.innerHTML = '';

        subjects.forEach((subject, index) => {
            const row = tbody.insertRow();
            const nameCell = row.insertCell(0);
            const gradeCell = row.insertCell(1);
            const actionCell = row.insertCell(2);

            nameCell.innerHTML = `<input type="text" class="subject-input" value="${subject.name}" onchange="updateSubjectName(${index}, this.value)">`;

            // Handle grades for the selected quarter
            let currentGrade = '';
            switch (currentQuarter) {
                case '1':
                    currentGrade = subject.firstQuarter !== null ? Math.round(subject.firstQuarter) : '';
                    break;
                case '2':
                    currentGrade = subject.secondQuarter !== null ? Math.round(subject.secondQuarter) : '';
                    break;
                case '3':
                    currentGrade = subject.thirdQuarter !== null ? Math.round(subject.thirdQuarter) : '';
                    break;
                case '4':
                    currentGrade = subject.fourthQuarter !== null ? Math.round(subject.fourthQuarter) : '';
                    break;
            }

            gradeCell.innerHTML = `
                <input 
                    type="text" 
                    maxlength="2" 
                    class="grade-input" 
                    value="${currentGrade}" 
                    oninput="updateGrade(${index}, this.value)" 
                    onpaste="handlePaste(event, ${index})"
                >`;

            actionCell.innerHTML = `<button class="delete-btn" onclick="deleteSubject(${index})">Delete</button>`;

            if (currentGrade && currentGrade < 75) {
                gradeCell.style.color = '#ff4757';
            }
        });

        calculateAverage();
    }

    function calculateAverage() {
        if (subjects.length === 0) {
            document.getElementById('average-display').textContent = 'No subjects added yet.';
            return;
        }

        let total = 0, count = 0;

        subjects.forEach(subject => {
            if (subject.firstQuarter !== null && !isNaN(subject.firstQuarter)) total += subject.firstQuarter, count++;
            if (subject.secondQuarter !== null && !isNaN(subject.secondQuarter)) total += subject.secondQuarter, count++;
            if (subject.thirdQuarter !== null && !isNaN(subject.thirdQuarter)) total += subject.thirdQuarter, count++;
            if (subject.fourthQuarter !== null && !isNaN(subject.fourthQuarter)) total += subject.fourthQuarter, count++;
        });

        if (count === 0) {
            document.getElementById('average-display').textContent = 'No valid grades to calculate.';
            return;
        }

        const average = total / count;
        let averageDisplay = `Average Grade: ${Math.round(average)}`;
        let averageClass = '';

        if (average >= 98) averageDisplay += ' - With Highest Honors', averageClass = 'with-highest-honors';
        else if (average >= 95) averageDisplay += ' - With High Honors', averageClass = 'with-high-honors';
        else if (average >= 90) averageDisplay += ' - With Honors', averageClass = 'with-honors';

        const averageElement = document.getElementById('average-display');
        averageElement.textContent = averageDisplay;
        averageElement.className = averageClass;
    }

    function handlePaste(event, index) {
        event.preventDefault();
        const pastedData = event.clipboardData.getData('text');
        updateGrade(index, pastedData);
    }

    window.onload = function() {
            // Wait a little bit before scrolling to the top to ensure page is fully loaded
            setTimeout(function() {
                window.scrollTo(0, 0); // Scroll to the top
            }, 50); // Small delay before scrolling to the top
        
            // Disable scrolling initially
            document.documentElement.style.overflow = 'hidden'; // Apply to html
            document.body.style.overflow = 'hidden'; // Apply to body
            
            // Show loading screen for 10 seconds
            setTimeout(function() {
                // Hide the loading screen after 10 seconds
                document.getElementById('loading-screen').classList.add('hidden');
                
                // Additional delay before enabling scrolling (e.g., 2 more seconds)
                setTimeout(function() {
                    // Allow scrolling after additional delay
                    document.documentElement.style.overflow = 'auto'; // Allow scrolling on html
                }, 1000); // Delay before allowing scrolling (2 seconds)
            }, 1000); // 10 seconds delay for the loading screen
        };

    document.getElementById('quarter-select').addEventListener('change', e => {
        currentQuarter = e.target.value;
        loadFromLocalStorage();
    });

    loadFromLocalStorage();
