import React, { useState } from 'react';
import { Stethoscope, Printer, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function PrescriptionCard({ selectedCase }) {
  const [weightKg, setWeightKg] = useState(12);
  const [veterinarianName, setVeterinarianName] = useState('Dr. Ananya Rao, B.V.Sc & A.H.');
  const [clinicName, setClinicName] = useState('CUPA Veterinary Hospital Bengaluru');

  const animalType = selectedCase?.animalType || 'Dog';
  const disease = selectedCase?.aiPrediction || 'Canine Mange';

  // Calculate veterinary dosages based on animal weight
  const calculateDosage = () => {
    if (disease.includes('Mange')) {
      return {
        medication: 'Ivermectin Oral Solution / Isoxazoline (Sarolaner/Fluralaner)',
        dosage: `${(weightKg * 0.2).toFixed(1)} mg oral weekly OR 1x chewable tablet (${weightKg <= 10 ? '10-20mg' : '20-40mg'})`,
        baths: 'Weekly Chlorhexidine + Miconazole / Lime-Sulfur Medicated Dip',
        instructions: 'Administer oral anti-parasitic once every 7 days for 4 consecutive weeks. Perform weekly skin scrapings until 2 consecutive negative cultures.'
      };
    } else if (disease.includes('Fungal') || disease.includes('Ringworm')) {
      return {
        medication: 'Itraconazole Oral Suspension + Terbinafine Topical Cream',
        dosage: `${(weightKg * 5).toFixed(0)} mg oral daily for 21 days`,
        baths: 'Miconazole + Ketoconazole Medicated Shampoo twice weekly',
        instructions: 'Apply topical cream directly to circular lesion margins twice daily. Isolate animal from uninfected pets during treatment.'
      };
    } else {
      return {
        medication: 'Cefpodoxime Proxetil / Amoxicillin-Clavulanate + Antihistamine',
        dosage: `${(weightKg * 10).toFixed(0)} mg oral twice daily for 10-14 days`,
        baths: 'Soothing Aloe & Oatmeal Antiseptic Bath',
        instructions: 'Keep wound area clean and dry. Use protective Elizabeth Collar if frequent scratching occurs.'
      };
    }
  };

  const regimen = calculateDosage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Stethoscope size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 800 }}>
              Veterinary Prescription & Treatment Card
            </h3>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Official Clinical Protocol & Weight-based Therapeutic Dosage
            </div>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px' }}
        >
          <Printer size={15} />
          <span>Print Clinical Card</span>
        </button>
      </div>

      {/* Patient & Clinic Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
            ATTENDING VETERINARIAN:
          </label>
          <input 
            type="text" 
            value={veterinarianName}
            onChange={(e) => setVeterinarianName(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
            CLINIC / NGO HOSPITAL:
          </label>
          <input 
            type="text" 
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
            ANIMAL BODY WEIGHT (KG):
          </label>
          <input 
            type="number" 
            value={weightKg}
            onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value)))}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}
          />
        </div>
      </div>

      {/* Official Prescription Protocol Box */}
      <div style={{
        background: 'var(--bg-main)',
        border: '1.5px solid var(--primary)',
        borderRadius: '14px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-low">PATIENT: {selectedCase?.id || 'DS-2026-00124'} ({animalType})</span>
          <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--primary)' }}>DIAGNOSIS: {disease}</span>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>1. PRIMARY SYSTEMIC THERAPEUTIC:</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{regimen.medication}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>Calculated Dosage: {regimen.dosage}</div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>2. TOPICAL BATH PROTOCOL:</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>{regimen.baths}</div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>3. CLINICAL INSTRUCTIONS:</div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.5, marginTop: '2px' }}>{regimen.instructions}</div>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        * Dosage generated using standard veterinary pharmacological references (Plumb's Veterinary Drug Handbook). Always verify animal health condition prior to administration.
      </div>

    </div>
  );
}
