// BACC Calculator Application
(function() {
  'use strict';
  
  // Application Data
  const BACC_DATA = {
    rankAllowances: {
      "E-1": 1200, "E-2": 1200, "E-3": 1150, "E-4": 1100, "E-5": 1000, 
      "E-6": 950, "E-7": 900, "E-8": 800, "E-9": 700,
      "W-1": 950, "W-2": 900, "W-3": 850, "W-4": 800, "W-5": 650,
      "O-1": 900, "O-2": 850, "O-3": 800, "O-4": 700, "O-5": 650, 
      "O-6": 550, "O-7": 450, "O-8": 400, "O-9": 350, "O-10": 300
    },
    geographicMultipliers: {
      "Low Cost": 0.8,
      "Standard Cost": 1.0,
      "High Cost": 1.5
    },
    ageMultipliers: {
      "Infant (0-12 months)": 1.4,
      "Toddler (13-24 months)": 1.3,
      "Preschool (25-60 months)": 1.0,
      "School-age (6-13 years)": 0.4
    },
    exampleScenarios: [
      {
        name: "Junior Enlisted Family",
        rank: "E-4",
        location: "High Cost",
        children: [{"age": "Preschool (25-60 months)"}, {"age": "School-age (6-13 years)"}]
      },
      {
        name: "Mid-Career NCO",
        rank: "E-6", 
        location: "Standard Cost",
        children: [{"age": "Infant (0-12 months)"}]
      },
      {
        name: "Officer with Multiple Children",
        rank: "O-3",
        location: "High Cost", 
        children: [{"age": "Toddler (13-24 months)"}, {"age": "Preschool (25-60 months)"}, {"age": "School-age (6-13 years)"}]
      }
    ]
  };

  // Application State
  let state = {
    childrenCount: 0,
    children: []
  };

  // DOM Elements
  let elements = {};

  // UNIFIED DATA COLLECTION SYSTEM
  function generateSessionId() {
    return 'calc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function initializeDataCollection() {
    const sessionData = {
      sessionId: generateSessionId(),
      timestamp: new Date().toISOString(),
      calculatorData: {},
      surveyData: {},
      metadata: { 
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };
    localStorage.setItem('researchData', JSON.stringify(sessionData));
    return sessionData;
  }

  function captureCalculatorData(fieldName, inputValue, result = null) {
    let data = JSON.parse(localStorage.getItem('researchData')) || initializeDataCollection();
    data.calculatorData[fieldName] = {
      input: inputValue,
      result: result,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('researchData', JSON.stringify(data));
    console.log('Calculator data captured:', fieldName, inputValue, result);
  }

  function captureSurveyData(questionId, response, questionText) {
    let data = JSON.parse(localStorage.getItem('researchData')) || initializeDataCollection();
    data.surveyData[questionId] = {
      response: response,
      questionText: questionText,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('researchData', JSON.stringify(data));
    console.log('Survey data captured:', questionId, response);
  }

  function exportUnifiedData() {
    const data = JSON.parse(localStorage.getItem('researchData'));
    if (!data) {
      alert('No data to export');
      return;
    }
    
    const csvContent = generateCSVFromUnifiedData(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `research-data-${data.sessionId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function generateCSVFromUnifiedData(data) {
    const headers = ['SessionID', 'Timestamp', 'DataType', 'Field', 'Value', 'QuestionText', 'Result'];
    const rows = [headers.join(',')];
    
    // Add calculator data rows
    Object.entries(data.calculatorData || {}).forEach(([field, info]) => {
      rows.push([
        data.sessionId,
        info.timestamp,
        'Calculator',
        field,
        `"${info.input}"`,
        '""',
        `"${info.result || ''}"`
      ].join(','));
    });
    
    // Add survey data rows
    Object.entries(data.surveyData || {}).forEach(([questionId, info]) => {
      rows.push([
        data.sessionId,
        info.timestamp,
        'Survey',
        questionId,
        `"${Array.isArray(info.response) ? info.response.join('; ') : info.response}"`,
        `"${info.questionText || ''}"`,
        '""'
      ].join(','));
    });
    
    return rows.join('\n');
  }

  // Initialize Application
  function init() {
    console.log('Initializing BACC Calculator...');
    
    // Initialize data collection system
    initializeDataCollection();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupApp);
    } else {
      setupApp();
    }
  }

  function setupApp() {
    console.log('Setting up application...');
    
    // Get DOM elements with error checking
    try {
      elements = {
        rankSelect: document.getElementById('rank'),
        locationSelect: document.getElementById('location'),
        costShareInput: document.getElementById('costShare'),
        addChildBtn: document.getElementById('addChild'),
        childrenContainer: document.getElementById('childrenContainer'),
        resultsSection: document.getElementById('resultsSection'),
        calculationResults: document.getElementById('calculationResults'),
        loadExampleBtn: document.getElementById('loadExample'),
        resetFormBtn: document.getElementById('resetForm'),
        printResultsBtn: document.getElementById('printResults'),
        exportDataBtn: document.getElementById('exportData'), // Add export button
        exampleModal: document.getElementById('exampleModal'),
        closeModalBtn: document.getElementById('closeModal')
      };
      
      // Check if all critical elements exist
      const criticalElements = ['rankSelect', 'locationSelect', 'costShareInput', 'addChildBtn', 'childrenContainer', 'calculationResults'];
      let missingElements = [];
      
      for (const elementName of criticalElements) {
        if (!elements[elementName]) {
          missingElements.push(elementName);
          console.error(`Critical element not found: ${elementName}`);
        }
      }
      
      if (missingElements.length > 0) {
        console.error('Missing critical DOM elements:', missingElements);
        return;
      }
      console.log('All DOM elements found successfully');
      
      // Setup event listeners
      setupEventListeners();
      
      // Initial calculation
      updateCalculation();
      
      // Initialize survey system
      surveySystem.init();
      
      console.log('Application setup complete');
      
    } catch (error) {
      console.error('Error during app setup:', error);
    }
  }

  function setupEventListeners() {
    console.log('Setting up event listeners...');
    try {
      // Form change listeners with data capture
      if (elements.rankSelect) {
        elements.rankSelect.addEventListener('change', function(event) {
          console.log('Rank changed to:', event.target.value);
          captureCalculatorData('rank', event.target.value);
          updateCalculation();
        });
        console.log('Rank select listener added');
      }
      
      if (elements.locationSelect) {
        elements.locationSelect.addEventListener('change', function(event) {
          console.log('Location changed to:', event.target.value);
          captureCalculatorData('location', event.target.value);
          updateCalculation();
        });
        console.log('Location select listener added');
      }
      
      if (elements.costShareInput) {
        elements.costShareInput.addEventListener('input', function(event) {
          console.log('Cost share changed to:', event.target.value);
          captureCalculatorData('costShare', event.target.value);
          updateCalculation();
        });
        console.log('Cost share input listener added');
      }

      // Button listeners
      if (elements.addChildBtn) {
        elements.addChildBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          console.log('Add child button clicked');
          addChild();
        });
        console.log('Add child button listener added');
      }
      
      if (elements.loadExampleBtn) {
        elements.loadExampleBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          console.log('Load example button clicked');
          showExampleModal();
        });
        console.log('Load example button listener added');
      }
      
      if (elements.resetFormBtn) {
        elements.resetFormBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          console.log('Reset form button clicked');
          resetForm();
        });
        console.log('Reset form button listener added');
      }
      
      if (elements.printResultsBtn) {
        elements.printResultsBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          console.log('Print results button clicked');
          window.print();
        });
        console.log('Print results button listener added');
      }

      // Export data button listener
      if (elements.exportDataBtn) {
        elements.exportDataBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          console.log('Export data button clicked');
          exportUnifiedData();
        });
        console.log('Export data button listener added');
      }
      
      if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          console.log('Close modal button clicked');
          hideExampleModal();
        });
        console.log('Close modal button listener added');
      }
      
      // Modal background click
      if (elements.exampleModal) {
        elements.exampleModal.addEventListener('click', function(event) {
          if (event.target === elements.exampleModal) {
            console.log('Modal background clicked');
            hideExampleModal();
          }
        });
        console.log('Modal background listener added');
      }
      
      // Setup scenario cards after DOM is ready
      setTimeout(setupScenarioCards, 200);
      
      console.log('Event listeners setup complete');
      
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }

  function setupScenarioCards() {
    try {
      const scenarioCards = document.querySelectorAll('.scenario-card');
      console.log('Setting up scenario cards, found:', scenarioCards.length);
      
      scenarioCards.forEach((card, index) => {
        card.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          const scenarioIndex = parseInt(this.dataset.scenario);
          console.log('Scenario card clicked:', scenarioIndex);
          loadExampleScenario(scenarioIndex);
        });
      });
      
      console.log('Scenario cards setup complete');
    } catch (error) {
      console.error('Error setting up scenario cards:', error);
    }
  }

  // Child Management
  function addChild() {
    try {
      console.log('Adding child...');
      state.childrenCount++;
      const childId = `child-${state.childrenCount}`;
      
      // Capture child addition
      captureCalculatorData('child_added', childId, state.childrenCount);
      
      const childHTML = `
        <div class="child-card" id="${childId}">
          <div class="child-header">
            <h4>Child ${state.childrenCount}</h4>
            <button type="button" class="btn btn--remove btn--sm" data-child-id="${childId}">Remove</button>
          </div>
          <div class="child-body">
            <div class="form-group">
              <label for="${childId}-age" class="form-label">Age Category *</label>
              <select id="${childId}-age" class="form-control child-age" required>
                <option value="">Select Age Category</option>
                <option value="Infant (0-12 months)">Infant (0-12 months)</option>
                <option value="Toddler (13-24 months)">Toddler (13-24 months)</option>
                <option value="Preschool (25-60 months)">Preschool (25-60 months)</option>
                <option value="School-age (6-13 years)">School-age (6-13 years)</option>
              </select>
            </div>
            <div class="child-allowance">
              <p class="allowance-amount" id="${childId}-amount">$0.00</p>
              <p class="allowance-details" id="${childId}-details">Select age to calculate</p>
            </div>
          </div>
        </div>
      `;
      
      // Remove "no children" message
      const noChildrenMsg = elements.childrenContainer.querySelector('.no-children');
      if (noChildrenMsg) {
        noChildrenMsg.remove();
      }
      
      // Add new child
      elements.childrenContainer.insertAdjacentHTML('beforeend', childHTML);
      
      // Add event listeners for new child
      const newAgeSelect = document.getElementById(`${childId}-age`);
      if (newAgeSelect) {
        newAgeSelect.addEventListener('change', function(event) {
          console.log('Child age changed to:', event.target.value);
          captureCalculatorData(`${childId}_age`, event.target.value);
          updateCalculation();
        });
      }
      
      const newRemoveBtn = elements.childrenContainer.querySelector(`[data-child-id="${childId}"]`);
      if (newRemoveBtn) {
        newRemoveBtn.addEventListener('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          const childId = this.dataset.childId;
          console.log('Remove child clicked for:', childId);
          removeChild(childId);
        });
      }
      
      updateChildrenArray();
      console.log('Child added successfully:', childId);
    } catch (error) {
      console.error('Error adding child:', error);
    }
  }

  function removeChild(childId) {
    try {
      console.log('Removing child:', childId);
      
      // Capture child removal
      captureCalculatorData('child_removed', childId);
      
      const childElement = document.getElementById(childId);
      if (childElement) {
        childElement.remove();
        updateChildrenArray();
        updateCalculation();
        
        // Show "no children" message if none remain
        if (elements.childrenContainer.children.length === 0) {
          elements.childrenContainer.innerHTML = '<p class="no-children">No children added yet. Click "Add Child" to get started.</p>';
        }
        
        console.log('Child removed successfully:', childId);
      } else {
        console.warn('Child element not found:', childId);
      }
      
    } catch (error) {
      console.error('Error removing child:', error);
    }
  }

  function updateChildrenArray() {
    try {
      state.children = [];
      const childCards = elements.childrenContainer.querySelectorAll('.child-card');
      
      childCards.forEach(card => {
        const ageSelect = card.querySelector('.child-age');
        state.children.push({
          id: card.id,
          age: ageSelect ? ageSelect.value : ''
        });
      });
      
      console.log('Children array updated. Count:', state.children.length);
      
    } catch (error) {
      console.error('Error updating children array:', error);
    }
  }

  // API call: fetch calculation from backend
  async function fetchBACCFromAPI(rank, location, costShare, children) {
    try {
      const response = await fetch('https://bacc-calculator-backend.onrender.com/api/calculate-bacc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rank, location, costShare, children })
      });
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      return null;
    }
  }

  // Calculations
  function calculateChildAllowance(rank, location, age, costShare) {
    // No longer used—calculation logic handled by backend API
    return { amount: 0, breakdown: null };
  }

  async function updateCalculation() {
    try {
      console.log('Updating calculation...');
      const rank = elements.rankSelect ? elements.rankSelect.value : '';
      const location = elements.locationSelect ? elements.locationSelect.value : '';
      const costShare = elements.costShareInput ? (parseFloat(elements.costShareInput.value) || 10) : 10;
      updateChildrenArray();
      
      // Capture calculation request
      captureCalculatorData('calculation_requested', {
        rank,
        location,
        costShare,
        childrenCount: state.children.length
      });
      
      // Fetch calculation from API
      const apiResult = await fetchBACCFromAPI(rank, location, costShare, state.children);
      
      if (apiResult && apiResult.perChild) {
        // Capture calculation result
        captureCalculatorData('calculation_result', apiResult.totalMonthly, apiResult);
        
        apiResult.perChild.forEach((childResult, i) => {
          const child = state.children[i];
          const amountElement = document.getElementById(`${child.id}-amount`);
          const detailsElement = document.getElementById(`${child.id}-details`);
          if (amountElement && detailsElement) {
            amountElement.textContent = `$${childResult.amount.toFixed(2)}`;
            detailsElement.textContent = "Monthly allowance";
          }
        });
        updateResultsSection(apiResult, rank, location, costShare, state.children);
      } else {
        updateResultsSection(null, rank, location, costShare, state.children);
      }
    } catch (error) {
      console.error('Error updating calculation:', error);
    }
  }

  function updateResultsSection(apiResult, rank, location, costShare, children) {
    try {
      if (!elements.calculationResults) {
        console.warn('Results element not found');
        return;
      }
      
      if (!apiResult || !rank || !location || children.length === 0 || !apiResult.totalMonthly) {
        elements.calculationResults.innerHTML = '<p class="results-prompt">Complete the form above to see your BACC calculation.</p>';
        return;
      }
      
      let resultsHTML = `
        <div class="total-allowance">
          <h3 class="total-monthly">$${apiResult.totalMonthly.toFixed(2)}</h3>
          <p class="total-annual">Monthly Total • $${apiResult.totalAnnual.toFixed(2)} Annual</p>
        </div>
        <div class="calculation-breakdown">
      `;
      
      apiResult.perChild.forEach((childResult, i) => {
        resultsHTML += `
          <div class="child-calculation">
            <h4>Child ${i+1} - ${childResult.age}</h4>
            <div class="final-amount">
              <p class="amount">$${childResult.amount.toFixed(2)} / month</p>
            </div>
          </div>
        `;
      });
      
      resultsHTML += '</div>';
      elements.calculationResults.innerHTML = resultsHTML;
      console.log('Results section updated');
    } catch (error) {
      console.error('Error updating results section:', error);
    }
  }

  function createChildCalculationHTML(childNumber, age, calculation) {
    const { amount, breakdown } = calculation;
    return `
      <div class="child-calculation">
        <h4>Child ${childNumber} - ${age}</h4>
        <div class="formula-steps">
          <div class="formula-step">
            <span class="step-label">Base Rank Allowance:</span>
            <span class="step-value">$${breakdown.baseAllowance.toFixed(2)}</span>
          </div>
          <div class="formula-step">
            <span class="step-label">Geographic Multiplier:</span>
            <span class="step-value">${breakdown.geoMultiplier}x</span>
          </div>
          <div class="formula-step">
            <span class="step-label">Age Multiplier:</span>
            <span class="step-value">${breakdown.ageMultiplier}x</span>
          </div>
          <div class="formula-step">
            <span class="step-label">Before Cost Share:</span>
            <span class="step-value">$${breakdown.beforeCostShare.toFixed(2)}</span>
          </div>
          <div class="formula-step">
            <span class="step-label">Cost Share (${(breakdown.costShareDecimal * 100).toFixed(0)}%):</span>
            <span class="step-value">-$${(breakdown.beforeCostShare * breakdown.costShareDecimal).toFixed(2)}</span>
          </div>
        </div>
        <div class="final-amount">
          <p class="amount">$${amount.toFixed(2)} / month</p>
        </div>
      </div>
    `;
  }

  // Modal functions
  function showExampleModal() {
    try {
      console.log('Showing example modal');
      if (elements.exampleModal) {
        elements.exampleModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Setup scenario cards if not already done
        setTimeout(setupScenarioCards, 100);
        
        console.log('Example modal shown');
      } else {
        console.warn('Example modal element not found');
      }
    } catch (error) {
      console.error('Error showing example modal:', error);
    }
  }

  function hideExampleModal() {
    try {
      console.log('Hiding example modal');
      if (elements.exampleModal) {
        elements.exampleModal.classList.add('hidden');
        document.body.style.overflow = '';
        console.log('Example modal hidden');
      }
    } catch (error) {
      console.error('Error hiding example modal:', error);
    }
  }

  function loadExampleScenario(index) {
    try {
      console.log('Loading example scenario:', index);
      const scenario = BACC_DATA.exampleScenarios[index];
      if (!scenario) {
        console.warn('Scenario not found at index:', index);
        return;
      }
      
      console.log('Loading scenario:', scenario);
      
      // Reset form first
      resetForm();
      
      // Set rank and location
      if (elements.rankSelect) {
        elements.rankSelect.value = scenario.rank;
        captureCalculatorData('example_scenario_rank', scenario.rank);
        console.log('Set rank to:', scenario.rank);
      }
      
      if (elements.locationSelect) {
        elements.locationSelect.value = scenario.location;
        captureCalculatorData('example_scenario_location', scenario.location);
        console.log('Set location to:', scenario.location);
      }
      
      // Add children
      scenario.children.forEach((childData, childIndex) => {
        console.log('Adding child:', childIndex, childData);
        addChild();
        
        // Set age for the most recently added child
        setTimeout(() => {
          const lastChild = elements.childrenContainer.last
