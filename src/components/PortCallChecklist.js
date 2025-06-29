import { useState, useRef } from 'react';
import './PortCallChecklist.css';

// Helper function to convert markdown-style links to JSX links
const convertLinksToClickable = (text) => {
  if (!text) return text;
  
  // Pattern for 📎 Link: [Text](URL) format
  const linkPattern = /📎\s*(Link|Portal|Forms|Fuel|Services|Customs|Pre-arrival|Marina|Events|Source):\s*\[([^\]]+)\]\(([^)]+)\)/g;
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  
  // First, handle markdown-style links
  let result = text.replace(linkPattern, (match, type, linkText, url) => {
    return `📎 ${type}: <a href="${url}" target="_blank" rel="noopener noreferrer" class="web-link">${linkText}</a>`;
  });
  
  // Then handle standalone URLs
  result = result.replace(urlPattern, (match, url) => {
    // Don't replace if it's already inside an <a> tag
    if (result.indexOf(`href="${url}"`) === -1) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="web-link">${url}</a>`;
    }
    return url;
  });
  
  return result;
};

// Helper component to render text with clickable links
const TextWithLinks = ({ children }) => {
  if (!children) return null;
  
  const convertedText = convertLinksToClickable(children);
  
  return (
    <span 
      dangerouslySetInnerHTML={{ __html: convertedText }}
      className="text-with-links"
    />
  );
};

// Simple Card component
const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
);

// Simple Accordion component
const Accordion = ({ type, children }) => (
  <div className="accordion">
    {children}
  </div>
);

const AccordionItem = ({ value, children }) => (
  <div className="accordion-item" data-value={value}>
    {children}
  </div>
);

const AccordionTrigger = ({ children, onClick, isOpen }) => (
  <button 
    className={`accordion-trigger ${isOpen ? 'open' : ''}`}
    onClick={onClick}
  >
    {children}
    <span className={`accordion-icon ${isOpen ? 'rotate' : ''}`}>▼</span>
  </button>
);

const AccordionContent = ({ children, isOpen }) => (
  <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
    <div className="accordion-content-inner">
      {children}
    </div>
  </div>
);

// Simple Button component
const Button = ({ children, onClick, className = "", ...props }) => (
  <button 
    className={`button ${className}`} 
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

// Data adapter function to convert API response to component format
const adaptChecklistData = (apiData) => {
  if (!apiData) return null;

  const sections = [];

  // ETA & ISPS Section
  if (apiData.port_formalities?.eta_notification) {
    const eta = apiData.port_formalities.eta_notification;
    let content = `${eta.summary || ''}\n\n`;
    
    if (eta.eta_deadline) content += `⏰ ETA Deadline: ${eta.eta_deadline}\n`;
    if (eta.contact_method) content += `📞 Contact Method: ${eta.contact_method}\n`;
    if (eta.vhf_channels) content += `📻 VHF Channels: ${eta.vhf_channels}\n`;
    if (eta.isps_required !== null) content += `🔐 ISPS Required: ${eta.isps_required ? 'Yes' : 'No'}`;
    if (eta.isps_threshold) content += ` (${eta.isps_threshold})`;
    content += '\n';
    if (eta.anchoring_allowed !== null) content += `⚓ Anchoring Before Clearance: ${eta.anchoring_allowed ? 'Allowed' : 'Not Allowed'}\n`;
    if (eta.source_url) content += `\n📖 Source: ${eta.source_url}`;
    
    sections.push({
      title: "ETA & ISPS Notification",
      content: content
    });
  }

  // Clearance Section
  if (apiData.port_formalities?.clearance_procedure) {
    const clearance = apiData.port_formalities.clearance_procedure;
    let content = `${clearance.summary || ''}\n\n`;
    
    if (clearance.location) content += `📍 Location: ${clearance.location}\n`;
    if (clearance.address) content += `🏢 Address: ${clearance.address}\n`;
    if (clearance.hours) content += `🕒 Hours: ${clearance.hours}\n`;
    if (clearance.required_documents) content += `📄 Required Documents: ${clearance.required_documents}\n`;
    if (clearance.processing_time) content += `⏱️ Processing Time: ${clearance.processing_time}\n`;
    if (clearance.fees) content += `💰 Fees: ${clearance.fees}\n`;
    if (clearance.contact_phone) content += `☎️ Phone: ${clearance.contact_phone}\n`;
    if (clearance.contact_email) content += `✉️ Email: ${clearance.contact_email}\n`;
    if (clearance.source_url) content += `\n📖 Source: ${clearance.source_url}`;
    
    sections.push({
      title: "Clearance Procedure",
      content: content
    });
  }

  // Temporary Importation Section
  if (apiData.port_formalities?.temporary_importation) {
    const ta = apiData.port_formalities.temporary_importation;
    let content = `${ta.summary || ''}\n\n`;
    
    if (ta.eu_vat_area !== null) content += `🇪🇺 EU VAT Area: ${ta.eu_vat_area ? 'Yes - EU VAT Territory' : 'No - Outside EU VAT'}\n`;
    if (ta.ta_eligible !== null) content += `📋 TA Eligible: ${ta.ta_eligible ? 'Yes' : 'No'}\n`;
    if (ta.ta_duration) content += `⏳ TA Duration: ${ta.ta_duration}\n`;
    if (ta.reset_possible !== null) content += `🔄 TA Reset Possible: ${ta.reset_possible ? 'Yes' : 'No'}`;
    if (ta.reset_distance) content += ` (${ta.reset_distance})`;
    content += '\n';
    if (ta.vat_applicable !== null) content += `💸 VAT Applicable: ${ta.vat_applicable ? 'Yes' : 'No'}`;
    if (ta.vat_rate) content += ` (${ta.vat_rate})`;
    content += '\n';
    if (ta.charter_restrictions) content += `⚠️ Charter Restrictions: ${ta.charter_restrictions}\n`;
    if (ta.penalties) content += `⚡ Penalties: ${ta.penalties}\n`;
    if (ta.customs_office) content += `🏛️ Customs Office: ${ta.customs_office}\n`;
    if (ta.source_url) content += `\n📖 Source: ${ta.source_url}`;
    
    sections.push({
      title: "Temporary Importation & VAT",
      content: content
    });
  }

  // Berthing Section
  if (apiData.port_formalities?.berthing_operations) {
    const berthing = apiData.port_formalities.berthing_operations;
    let content = `${berthing.summary || ''}\n\n`;
    
    if (berthing.reservation_method) content += `📋 Reservation Method: ${berthing.reservation_method}\n`;
    if (berthing.reservation_mandatory !== null) content += `⚠️ Reservation Required: ${berthing.reservation_mandatory ? 'Yes' : 'No'}\n`;
    if (berthing.marina_contacts) content += `📞 Marina Contacts: ${berthing.marina_contacts}\n`;
    if (berthing.anchoring_regulations) content += `⚓ Anchoring Rules: ${berthing.anchoring_regulations}\n`;
    if (berthing.depth_restrictions) content += `🌊 Depth Restrictions: ${berthing.depth_restrictions}\n`;
    if (berthing.size_limitations) content += `📏 Size Limitations: ${berthing.size_limitations}\n`;
    if (berthing.berthing_fees) content += `💰 Berthing Fees: ${berthing.berthing_fees}\n`;
    if (berthing.source_url) content += `\n📖 Source: ${berthing.source_url}`;
    
    sections.push({
      title: "Berthing & Marina Operations",
      content: content
    });
  }

  // Documentation Section
  if (apiData.port_formalities?.required_documentation) {
    const docs = apiData.port_formalities.required_documentation;
    let content = `${docs.summary || ''}\n\n`;
    
    if (docs.crew_documents) content += `👥 Crew Documents: ${docs.crew_documents}\n`;
    if (docs.vessel_documents) content += `🚢 Vessel Documents: ${docs.vessel_documents}\n`;
    if (docs.insurance_requirements) content += `🛡️ Insurance Requirements: ${docs.insurance_requirements}\n`;
    if (docs.pet_certificates) content += `🐕 Pet Certificates: ${docs.pet_certificates}\n`;
    if (docs.health_declarations) content += `🏥 Health Declarations: ${docs.health_declarations}\n`;
    if (docs.charter_licenses) content += `📜 Charter Licenses: ${docs.charter_licenses}\n`;
    if (docs.source_url) content += `\n📖 Source: ${docs.source_url}`;
    
    sections.push({
      title: "Required Documentation",
      content: content
    });
  }

  // Port Services Section
  if (apiData.port_formalities?.port_services) {
    const services = apiData.port_formalities.port_services;
    let content = `${services.summary || ''}\n\n`;
    
    if (services.fuel_bunkering) content += `⛽ Fuel Bunkering: ${services.fuel_bunkering}\n`;
    if (services.waste_disposal) content += `🗑️ Waste Disposal: ${services.waste_disposal}\n`;
    if (services.provisioning_allowed) content += `🛒 Provisioning: ${services.provisioning_allowed}\n`;
    if (services.repair_services) content += `🔧 Repair Services: ${services.repair_services}\n`;
    if (services.agent_services) content += `🤝 Agent Services: ${services.agent_services}\n`;
    if (services.emergency_contacts) content += `🚨 Emergency Contacts: ${services.emergency_contacts}\n`;
    if (services.source_url) content += `\n📖 Source: ${services.source_url}`;
    
    sections.push({
      title: "Port Services",
      content: content
    });
  }

  // Local Regulations Section
  if (apiData.port_formalities?.local_regulations) {
    const regs = apiData.port_formalities.local_regulations;
    let content = `${regs.summary || ''}\n\n`;
    
    if (regs.noise_restrictions) content += `🔇 Noise Restrictions: ${regs.noise_restrictions}\n`;
    if (regs.environmental_rules) content += `🌿 Environmental Rules: ${regs.environmental_rules}\n`;
    if (regs.seasonal_restrictions) content += `📅 Seasonal Restrictions: ${regs.seasonal_restrictions}\n`;
    if (regs.security_zones) content += `🛡️ Security Zones: ${regs.security_zones}\n`;
    if (regs.special_events) content += `🎉 Special Events: ${regs.special_events}\n`;
    if (regs.local_contacts) content += `📞 Local Contacts: ${regs.local_contacts}\n`;
    if (regs.source_url) content += `\n📖 Source: ${regs.source_url}`;
    
    sections.push({
      title: "Local Regulations",
      content: content
    });
  }

  // GO/NO-GO Decision Section
  if (apiData.go_no_go_decision) {
    const decision = apiData.go_no_go_decision;
    sections.push({
      title: "Conditional Approval",
      content: `Confidence Level: ${decision.confidence_level || 'Not specified'}\n` +
        `Ready to Proceed:\n${decision.ready_to_proceed?.map(item => `- ${item}`).join('\n') || 'Not specified'}\n\n` +
        `Required Actions:\n${decision.required_actions?.map(item => `- ${item}`).join('\n') || 'Not specified'}\n\n` +
        `Risk Factors:\n${decision.risk_factors?.map(item => `- ${item}`).join('\n') || 'Not specified'}\n\n` +
        `Critical Deadlines:\n${decision.critical_deadlines?.map(item => `- ${item}`).join('\n') || 'Not specified'}`
    });
  }

  return {
    port: apiData.metadata?.port_name || 'Unknown Port',
    date: apiData.metadata?.arrival_date || 'Unknown Date',
    flag: apiData.metadata?.yacht_flag || 'Unknown Flag',
    usage: apiData.metadata?.activity_type || 'Unknown Activity',
    summary: apiData.summary || [],
    sections: sections
  };
};

export default function PortCallChecklist({ checklistData: rawChecklistData, onNewChecklist }) {
  const [openItems, setOpenItems] = useState(new Set());
  const componentRef = useRef();
  
  const handlePrint = () => {
    // Ouvrir tous les accordéons pour l'impression
    const allSections = new Set();
    for (let i = 0; i < (adaptChecklistData(rawChecklistData)?.sections?.length || 0); i++) {
      allSections.add(i);
    }
    setOpenItems(allSections);
    
    // Attendre que le DOM soit mis à jour, puis imprimer
    setTimeout(() => {
      window.print();
    }, 100);
  };
  
  // Adapt the data format
  const checklistData = adaptChecklistData(rawChecklistData);
  
  if (!checklistData) {
    return <div>No checklist data available</div>;
  }

  const toggleAccordion = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="portcall-checklist">
      <div ref={componentRef} className="printable-content">
        <Card>
          <CardContent>
            <h2 className="checklist-title">PortCall Checklist – {checklistData.port}</h2>
            <p className="checklist-meta">
              📅 {checklistData.date} | ⛵ {checklistData.usage} | 🏴 {checklistData.flag}
            </p>
            <ul className="summary-list">
              {checklistData.summary.map((item, index) => (
                <li key={index}><TextWithLinks>{item}</TextWithLinks></li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Accordion type="multiple">
          {checklistData.sections.map((section, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger 
                onClick={() => toggleAccordion(index)}
                isOpen={openItems.has(index)}
              >
                {section.title}
              </AccordionTrigger>
              <AccordionContent isOpen={openItems.has(index)}>
                <div className="section-content">
                  <TextWithLinks>{section.content}</TextWithLinks>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="disclaimer">
          ⚠️ Les informations ci-dessus sont générées automatiquement. Vérifiez les données critiques avec les autorités locales avant toute opération.
        </div>
        
        <div className="ai-signature print-only">
          🤖 Generated by PortCall AI | {new Date().toLocaleDateString()}
        </div>
      </div>
      
      <div className="action-buttons no-print">
        <Button onClick={handlePrint} className="export-pdf-btn">
          🖨️ Exporter en PDF
        </Button>
        
        {onNewChecklist && (
          <Button onClick={onNewChecklist} className="new-checklist-btn">
            New Checklist
          </Button>
        )}
      </div>
    </div>
  );
}