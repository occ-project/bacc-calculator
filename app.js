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
  
  // Initialize Application
  function init() {
    console.log('Initializing BACC Calculator...');
    
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
      // Form change listeners
      if (elements.rankSelect) {
        elements.rankSelect.addEventListener('change', function(event) {
          console.log('Rank changed to:', event.target.value);
          updateCalculation();
        });
        console.log('Rank select listener added');
      }
      
      if (elements.locationSelect) {
        elements.locationSelect.addEventListener('change', function(event) {
          console.log('Location changed to:', event.target.value);
          updateCalculation();
        });
        console.log('Location select listener added');
      }
      
      if (elements.costShareInput) {
        elements.costShareInput.addEventListener('input', function(event) {
          console.log('Cost share changed to:', event.target.value);
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
      const response = await fetch('http://localhost:5050/api/calculate-bacc', {
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
      
      // Fetch calculation from API
      const apiResult = await fetchBACCFromAPI(rank, location, costShare, state.children);
      
      if (apiResult && apiResult.perChild) {
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
        console.log('Set rank to:', scenario.rank);
      }
      
      if (elements.locationSelect) {
        elements.locationSelect.value = scenario.location;
        console.log('Set location to:', scenario.location);
      }
      
      // Add children
      scenario.children.forEach((childData, childIndex) => {
        console.log('Adding child:', childIndex, childData);
        addChild();
        
        // Set age for the most recently added child
        setTimeout(() => {
          const lastChild = elements.childrenContainer.lastElementChild;
          if (lastChild && lastChild.classList.contains('child-card')) {
            const ageSelect = lastChild.querySelector('.child-age');
            if (ageSelect) {
              ageSelect.value = childData.age;
              console.log('Set child age to:', childData.age);
            }
          }
        }, 50 * (childIndex + 1));
      });
      
      // Update calculation after a brief delay
      setTimeout(() => {
        updateCalculation();
        hideExampleModal();
        
        // Scroll to results
        if (elements.resultsSection) {
          elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
      console.log('Example scenario loaded');
      
    } catch (error) {
      console.error('Error loading example scenario:', error);
    }
  }
  
  function resetForm() {
    try {
      console.log('Resetting form');
      
      // Reset form fields
      if (elements.rankSelect) elements.rankSelect.value = '';
      if (elements.locationSelect) elements.locationSelect.value = '';
      if (elements.costShareInput) elements.costShareInput.value = '10';
      
      // Reset state
      state.children = [];
      state.childrenCount = 0;
      
      // Reset children container
      if (elements.childrenContainer) {
        elements.childrenContainer.innerHTML = '<p class="no-children">No children added yet. Click "Add Child" to get started.</p>';
      }
      
      // Reset results
      if (elements.calculationResults) {
        elements.calculationResults.innerHTML = '<p class="results-prompt">Complete the form above to see your BACC calculation.</p>';
      }
      
      console.log('Form reset complete');
      
    } catch (error) {
      console.error('Error resetting form:', error);
    }
  }

  // Survey System
  const surveySystem = {
    currentPage: 0,
    totalPages: 0,
    responses: {},
    
    questions: [
      {
        id: 'introduction',
        type: 'info',
        title: 'Help Shape the Future of Military Family Support',
        content: `
          <div class="survey-description">
            <p><strong>Your input is critical to advocating for BACC and other family support programs.</strong> Understanding the specific barriers that military families face with current child care options gives us the evidence needed to:</p>
            <ul>
              <li><strong>Demonstrate the need</strong> for BACC to military leadership and policymakers</li>
              <li><strong>Advocate effectively</strong> for program implementation and funding</li>
              <li><strong>Shape program design</strong> to address real military family challenges</li>
            </ul>
            <p><strong>Your voice matters.</strong> Every response helps build the case for better support for military families.</p>
            
            <h4>Privacy & Data Use Statement:</h4>
            <p>All responses are <strong>completely anonymous</strong> and collected for research and advocacy purposes only. No personal identifying information is collected or stored. Response data will be used solely to understand military family child care challenges and advocate for improved programs and policies. Participation is voluntary and you may skip any question.</p>
          </div>
        `
      },
      {
        id: 'currentPrograms',
        type: 'radio',
        title: 'Do you currently utilize any Department of Defense child care programs or Military Fee Assistance Programs?',
        description: 'This includes programs such as: Child Development Centers (CDC), Family Child Care (FCC), School Age Care (SAC), Military Fee Assistance Programs',
        options: [
          'Yes, I currently use DoD child care programs',
          'No, I do not currently use DoD child care programs (by choice)',
          'No, I do not use DoD child care programs because I do not qualify or they are inaccessible to me',
          'I have used them in the past but not currently'
        ],
        required: true
      },
      {
        id: 'programPreference',
        type: 'radio',
        title: 'Program Preference',
        description: `BACC would operate similarly to Basic Allowance for Housing (BAH) - it would be a <strong>non-taxable entitlement</strong> available to military families who <strong>opt out</strong> of DoD-operated Child Development Centers (CDC) or School Age Care (SAC) programs to seek child care in the civilian market. Like BAH, it would be <strong>entirely up to the family to determine the best way to spend their BACC</strong>, and their child care methods would <strong>not require approval</strong> from the military.<br><br>Based on your current experience with DoD child care programs, if BACC were available today, would you:`,
        options: [
          'Choose to opt out of my current DoD program(s) and use BACC for civilian child care',
          'Continue using my current DoD program(s) instead of opting for BACC',
          'Use both options depending on the situation (when available/appropriate)',
          'I\'m not sure - would need more information about BACC implementation'
        ],
        followUp: true,
        conditional: (responses) => responses.currentPrograms === 'Yes, I currently use DoD child care programs'
      },
      {
        id: 'qualityCare',
        type: 'radio',
        title: 'Based on your experience (or attempts to access) military child care programs, how much do you agree with this statement:',
        statement: '"Access to BACC would significantly impact my family\'s access to quality child care."',
        options: [
          'Strongly Agree',
          'Agree',
          'Neither Agree nor Disagree',
          'Disagree',
          'Strongly Disagree'
        ],
        followUp: true,
        followUpText: 'Please explain your answer. If you don\'t currently use DoD programs, please indicate if this is due to ineligibility, programs not meeting your needs, or other reasons:'
      },
      {
        id: 'missionReadiness',
        type: 'radio',
        title: 'How much do you agree with this statement:',
        statement: '"Access to BACC would significantly impact my mission readiness and ability to fulfill my military duties."',
        options: [
          'Strongly Agree',
          'Agree',
          'Neither Agree nor Disagree',
          'Disagree',
          'Strongly Disagree'
        ],
        followUp: true,
        followUpText: 'Please explain how BACC would or would not affect your mission readiness:'
      },
      {
        id: 'maritalStatus',
        type: 'radio',
        title: 'What is your current marital status?',
        options: [
          'Single',
          'Married',
          'Divorced/Separated',
          'Prefer not to answer'
        ],
        required: true
      },

      {
        id: 'spouseImpact',
        type: 'radio',
        title: 'How much do you agree with this statement:',
        statement: '"Access to BACC would significantly impact my spouse\'s ability to pursue employment or education opportunities."',
        options: [
          'Strongly Agree',
          'Agree',
          'Neither Agree nor Disagree',
          'Disagree',
          'Strongly Disagree',
          'Not Applicable - My spouse is not seeking employment or education'
        ],
        followUp: true,
        followUpText: 'Please explain how BACC would affect your spouse\'s opportunities:',
        conditional: (responses) => responses.maritalStatus === 'Married'
      },
      {
        id: 'careerDecision',
        type: 'radio',
        title: 'How much do you agree with this statement:',
        statement: '"Access to BACC would significantly impact my decision to continue or advance my career in the military."',
        options: [
          'Strongly Agree',
          'Agree',
          'Neither Agree nor Disagree',
          'Disagree',
          'Strongly Disagree'
        ],
        followUp: true,
        followUpText: 'Please explain how BACC would influence your military career decisions:'
      },
      {
        id: 'currentHurdles',
        type: 'checkbox',
        title: 'What hurdles or challenges with existing military child care programs would BACC help you overcome?',
        description: 'Your answers help us demonstrate specific barriers that need to be addressed. Select all that apply:',
        options: [
          'Need for non-traditional care hours (evenings, weekends, holidays)',
          'Do not meet program eligibility requirements',
          'No available participating centers in my area',
          'Available care doesn\'t meet quality standards I expect',
          'Care doesn\'t meet logistical needs (location, transportation, scheduling)',
          'Care doesn\'t accommodate religious or cultural requirements',
          'Care doesn\'t meet my child\'s special medical or developmental needs',
          'Long waiting lists for available programs',
          'Cost is still too high even with assistance',
          'Administrative burden or paperwork requirements',
          'Limited provider options/lack of choice',
          'Inflexible program rules or requirements',
          'Programs don\'t accommodate deployment or TDY schedules',
          'I don\'t currently face significant hurdles with existing programs'
        ],
        allowOther: true,
        followUp: true,
        followUpText: 'Please provide additional details about the challenges you selected or how BACC would address them. This information directly supports advocacy efforts:'
      },
      {
        id: 'thankyou',
        type: 'info',
        title: 'Thank You for Making a Difference!',
        content: `
          <div class="survey-description">
            <p>Your responses will be included in advocacy materials and research that directly supports:</p>
            <ul>
              <li>Policy recommendations to military leadership</li>
              <li>Evidence-based arguments for BACC implementation</li>
              <li>Documentation of real challenges facing military families</li>
            </ul>
            <p><strong>Your voice helps ensure military families get the support they deserve.</strong></p>
          </div>
        `
      }
    ],

    init() {
      this.bindEvents();
    },

    bindEvents() {
      const startButton = document.getElementById('startSurvey');
      const nextButton = document.getElementById('surveyNext');
      const backButton = document.getElementById('surveyBack');
      const skipButton = document.getElementById('surveySkip');

      if (startButton) {
        startButton.addEventListener('click', () => this.startSurvey());
      }

      if (nextButton) {
        nextButton.addEventListener('click', () => this.nextPage());
      }

      if (backButton) {
        backButton.addEventListener('click', () => this.previousPage());
      }

      if (skipButton) {
        skipButton.addEventListener('click', () => this.skipSurvey());
      }

      // Close modal on background click
      const modal = document.getElementById('surveyModal');
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeSurvey();
          }
        });
      }
    },

    startSurvey() {
      this.currentPage = 0;
      this.responses = {};
      this.calculateTotalPages();
      this.showModal();
      this.renderCurrentPage();
    },

    calculateTotalPages() {
      this.totalPages = this.questions.filter(q => {
        if (q.conditional) {
          return q.conditional(this.responses);
        }
        return true;
      }).length;
    },

    showModal() {
      const modal = document.getElementById('surveyModal');
      if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
    },

    closeSurvey() {
      const modal = document.getElementById('surveyModal');
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    },

    skipSurvey() {
      if (confirm('Are you sure you want to skip the survey? Your input helps advocate for military family support programs.')) {
        this.closeSurvey();
      }
    },

    renderCurrentPage() {
      const availableQuestions = this.getAvailableQuestions();
      const question = availableQuestions[this.currentPage];
      
      if (!question) return;

      this.updateProgress();
      this.renderQuestion(question);
      this.updateButtons();
    },

    getAvailableQuestions() {
      return this.questions.filter(q => {
        if (q.conditional) {
          return q.conditional(this.responses);
        }
        return true;
      });
    },

    updateProgress() {
      const availableQuestions = this.getAvailableQuestions();
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      
      const progress = ((this.currentPage + 1) / availableQuestions.length) * 100;
      
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
      
      if (progressText) {
        progressText.textContent = `Question ${this.currentPage + 1} of ${availableQuestions.length}`;
      }
    },

    renderQuestion(question) {
      const content = document.getElementById('surveyContent');
      if (!content) return;

      let html = `<div class="survey-question">`;
      
      if (question.type === 'info') {
        html += `
          <h3>${question.title}</h3>
          ${question.content}
        `;
      } else {
        html += `<h3>${question.title}</h3>`;
        
        if (question.description) {
          html += `<div class="survey-description">${question.description}</div>`;
        }
        
        if (question.statement) {
          html += `<p><em>${question.statement}</em></p>`;
        }

        if (question.type === 'radio') {
          html += `<ul class="survey-options">`;
          question.options.forEach((option, index) => {
            const checked = this.responses[question.id] === option ? 'checked' : '';
            html += `
              <li>
                <label>
                  <input type="radio" name="${question.id}" value="${option}" ${checked}>
                  <span>${option}</span>
                </label>
              </li>
            `;
          });
          html += `</ul>`;
        }

        if (question.type === 'checkbox') {
          html += `<ul class="survey-options">`;
          question.options.forEach((option, index) => {
            const checked = this.responses[question.id] && this.responses[question.id].includes(option) ? 'checked' : '';
            html += `
              <li>
                <label>
                  <input type="checkbox" name="${question.id}" value="${option}" ${checked}>
                  <span>${option}</span>
                </label>
              </li>
            `;
          });
          
          if (question.allowOther) {
            const otherValue = this.responses[`${question.id}_other`] || '';
            html += `
              <li>
                <label>
                  <input type="text" name="${question.id}_other" placeholder="Other (please specify):" value="${otherValue}" style="margin-left: 1.5rem; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; width: 100%;">
                </label>
              </li>
            `;
          }
          html += `</ul>`;
        }

        if (question.followUp) {
          const followUpValue = this.responses[`${question.id}_followup`] || '';
          html += `
            <textarea 
              class="survey-textarea" 
              name="${question.id}_followup" 
              placeholder="${question.followUpText || 'Please explain your answer:'}"
            >${followUpValue}</textarea>
          `;
        }
      }

      html += `</div>`;
      content.innerHTML = html;

      // Add event listeners for form elements
      this.bindQuestionEvents(question);
    },

    bindQuestionEvents(question) {
      const inputs = document.querySelectorAll(`input[name="${question.id}"], textarea[name="${question.id}_followup"], input[name="${question.id}_other"]`);
      
      inputs.forEach(input => {
        input.addEventListener('change', () => {
          this.saveResponse(question, input);
        });
      });
    },

    saveResponse(question, input) {
      if (question.type === 'radio') {
        if (input.checked) {
          this.responses[question.id] = input.value;
        }
      } else if (question.type === 'checkbox') {
        if (!this.responses[question.id]) {
          this.responses[question.id] = [];
        }
        
        if (input.checked && !this.responses[question.id].includes(input.value)) {
          this.responses[question.id].push(input.value);
        } else if (!input.checked) {
          this.responses[question.id] = this.responses[question.id].filter(v => v !== input.value);
        }
      }
      
      // Save follow-up responses
      if (input.name.includes('_followup')) {
        this.responses[input.name] = input.value;
      }
      
      if (input.name.includes('_other')) {
        this.responses[input.name] = input.value;
      }
    },

    updateButtons() {
      const availableQuestions = this.getAvailableQuestions();
      const backButton = document.getElementById('surveyBack');
      const nextButton = document.getElementById('surveyNext');
      const skipButton = document.getElementById('surveySkip');

      if (backButton) {
        backButton.style.display = this.currentPage === 0 ? 'none' : 'inline-block';
      }

      if (nextButton) {
        if (this.currentPage === availableQuestions.length - 1) {
          nextButton.textContent = 'Finish';
        } else {
          nextButton.textContent = 'Next';
        }
      }

      if (skipButton) {
        skipButton.style.display = this.currentPage === availableQuestions.length - 1 ? 'none' : 'inline-block';
      }
    },

    nextPage() {
      const availableQuestions = this.getAvailableQuestions();
      
      if (this.currentPage === availableQuestions.length - 1) {
        this.submitSurvey();
        return;
      }

      this.currentPage++;
      this.recalculatePages();
      this.renderCurrentPage();
    },

    previousPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderCurrentPage();
      }
    },

    recalculatePages() {
      // Recalculate available pages in case conditional logic changed
      const availableQuestions = this.getAvailableQuestions();
      if (this.currentPage >= availableQuestions.length) {
        this.currentPage = availableQuestions.length - 1;
      }
    },

    async submitSurvey() {
      try {
        const response = await fetch('http://localhost:5050/api/submit-survey', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            responses: this.responses
          })
        });

        if (response.ok) {
          console.log('Survey submitted successfully');
        } else {
          console.error('Error submitting survey');
        }
      } catch (error) {
        console.error('Error submitting survey:', error);
      }

      this.closeSurvey();
    }
  };
  
  // Start the application
  console.log('Starting BACC Calculator application');
  init();
})();

