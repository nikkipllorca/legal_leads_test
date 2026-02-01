'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CaseForm() {
    const [step, setStep] = useState(1); // 1: Stats/Calculator, 2: Form
    const [formData, setFormData] = useState({
        hardCosts: '',
        severity: '1.5',
        isCommercial: false,
        fname: '',
        lname: '',
        email: '',
        phone: '',
        city: '',
    });
    const [estimateRange, setEstimateRange] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);

    const calculateEstimate = () => {
        const econ = parseFloat(formData.hardCosts) || 0;
        let mult = parseFloat(formData.severity);
        if (formData.isCommercial) mult = Math.max(mult, 10);

        const base = econ * mult;
        const low = base * 0.8;
        const high = base * 1.2;

        const range = `$${Math.round(low).toLocaleString()} - $${Math.round(high).toLocaleString()}`;
        setEstimateRange(range);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const media_urls: string[] = [];

            // 1. Upload files first if any
            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `leads/${Date.now()}_${fileName}`;

                    const { error: uploadError, data } = await supabase.storage
                        .from('media_files')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;
                    if (data) media_urls.push(data.path);
                }
            }

            // 2. Insert lead with media_urls
            const { error } = await supabase.from('leads').insert([
                {
                    first_name: formData.fname,
                    last_name: formData.lname,
                    email: formData.email,
                    phone: formData.phone,
                    city: formData.city,
                    is_commercial: formData.isCommercial,
                    estimated_damage: parseFloat(formData.hardCosts) || 0,
                    injury_severity: parseFloat(formData.severity),
                    estimate_range: estimateRange,
                    media_urls: media_urls
                },
            ]);

            if (error) throw error;

            alert('Estimate secured! A Tier-1 specialist will contact you shortly.');
            setStep(1);
            setFiles(null);
            setFormData({
                hardCosts: '',
                severity: '1.5',
                isCommercial: false,
                fname: '',
                lname: '',
                email: '',
                phone: '',
                city: '',
            });
        } catch (error: any) {
            console.error('Error submitting lead:', error.message);
            alert('Error submitting case. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-card">
            <h2>Case <span>Evaluation</span></h2>

            {step === 1 ? (
                <div id="calc-inputs">
                    <div className="input-group">
                        <label>Estimated Economic Damages ($)</label>
                        <input
                            type="number"
                            value={formData.hardCosts}
                            onChange={(e) => setFormData({ ...formData, hardCosts: e.target.value })}
                            placeholder="Total medical + funeral + wages + repair"
                        />
                    </div>
                    <div className="input-group">
                        <label>Injury Severity</label>
                        <select
                            value={formData.severity}
                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        >
                            <option value="1.5">Minor Injuries</option>
                            <option value="3">Severe / Surgery</option>
                            <option value="5">Permanent / Death</option>
                        </select>
                    </div>
                    <div className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={formData.isCommercial}
                            onChange={(e) => setFormData({ ...formData, isCommercial: e.target.checked })}
                            style={{ width: 'auto', margin: 0 }}
                        />
                        <span>Accident involved an 18-wheeler?</span>
                    </div>
                    <button onClick={calculateEstimate}>See Estimate</button>
                </div>
            ) : (
                <>
                    <div id="estimate-display">
                        <h4>Potential Settlement Range</h4>
                        <div>{estimateRange}</div>
                    </div>

                    <form onSubmit={handleSubmit} id="lead-form">
                        <div className="row">
                            <div className="input-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={formData.fname}
                                    onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lname}
                                    onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="row">
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <label>City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Accident Photos / Documents (Optional)</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                onChange={(e) => setFiles(e.target.files)}
                                style={{ padding: '8px', fontSize: '0.8rem' }}
                            />
                            {files && files.length > 0 && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '5px' }}>
                                    {files.length} file(s) selected
                                </p>
                            )}
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Uploading & Submitting...' : 'Submit Case For Review'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ background: 'transparent', color: 'var(--gold)', marginTop: '10px', padding: '8px', fontSize: '0.85rem' }}
                        >
                            Back to Calculator
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
