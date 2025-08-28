import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Edit2, AlertCircle } from 'lucide-react';
import { CVSchema } from '@/lib/validations/cv';

export default function CVReview({ initialCV, onSave, isSaving }) {
  const [cv, setCV] = useState(initialCV);
  const [errors, setErrors] = useState({});

  // Validate and save
  const handleSave = () => {
    const result = CVSchema.safeParse(cv);
    if (!result.success) {
      // Map Zod errors to field names
      const fieldErrors = {};
      result.error.errors.forEach(e => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSave(cv);
  };

  // Helper to update fields
  const updateField = (field, value) => {
    setCV(prev => ({ ...prev, [field]: value }));
  };

  // Helper to update array fields
  const updateArrayField = (field, index, key, value) => {
    setCV(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, [key]: value } : item)
    }));
  };

  return (
    <div className="space-y-8">
      {/* Personal Info & Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Name"
            value={cv.name || ''}
            onChange={e => updateField('name', e.target.value)}
            placeholder="Full Name"
            error={errors.name}
          />
          <Input
            label="Email"
            value={cv.email || ''}
            onChange={e => updateField('email', e.target.value)}
            placeholder="Email Address"
            error={errors.email}
          />
          <Input
            label="Phone"
            value={cv.phone || ''}
            onChange={e => updateField('phone', e.target.value)}
            placeholder="Phone Number"
            error={errors.phone}
          />
          <Input
            label="Location"
            value={cv.location || ''}
            onChange={e => updateField('location', e.target.value)}
            placeholder="Location"
            error={errors.location}
          />
          <Textarea
            label="Summary"
            value={cv.summary || ''}
            onChange={e => updateField('summary', e.target.value)}
            placeholder="Professional summary or objective"
            error={errors.summary}
          />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="px-3 py-1 text-base">
                {skill}
              </Badge>
            ))}
          </div>
          <Input
            label="Add Skill"
            placeholder="Type a skill and press Enter"
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                updateField('skills', [...cv.skills, e.target.value.trim()]);
                e.target.value = '';
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cv.experience.map((exp, idx) => (
            <div key={idx} className="border-l-4 border-blue-200 dark:border-blue-600 pl-4 mb-4">
              <Input
                label="Job Title"
                value={exp.job_title}
                onChange={e => updateArrayField('experience', idx, 'job_title', e.target.value)}
                placeholder="Job Title"
                error={errors[`experience.${idx}.job_title`]}
              />
              <Input
                label="Company"
                value={exp.company}
                onChange={e => updateArrayField('experience', idx, 'company', e.target.value)}
                placeholder="Company"
                error={errors[`experience.${idx}.company`]}
              />
              <Input
                label="Start Date"
                value={exp.start_date || ''}
                onChange={e => updateArrayField('experience', idx, 'start_date', e.target.value)}
                placeholder="Start Date"
              />
              <Input
                label="End Date"
                value={exp.end_date || ''}
                onChange={e => updateArrayField('experience', idx, 'end_date', e.target.value)}
                placeholder="End Date"
              />
              <Textarea
                label="Description"
                value={exp.description || ''}
                onChange={e => updateArrayField('experience', idx, 'description', e.target.value)}
                placeholder="Describe your role and achievements"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cv.education.map((edu, idx) => (
            <div key={idx} className="border-l-4 border-green-200 dark:border-green-600 pl-4 mb-4">
              <Input
                label="Degree"
                value={edu.degree}
                onChange={e => updateArrayField('education', idx, 'degree', e.target.value)}
                placeholder="Degree"
                error={errors[`education.${idx}.degree`]}
              />
              <Input
                label="Institution"
                value={edu.institution}
                onChange={e => updateArrayField('education', idx, 'institution', e.target.value)}
                placeholder="Institution"
                error={errors[`education.${idx}.institution`]}
              />
              <Input
                label="Start Date"
                value={edu.start_date || ''}
                onChange={e => updateArrayField('education', idx, 'start_date', e.target.value)}
                placeholder="Start Date"
              />
              <Input
                label="End Date"
                value={edu.end_date || ''}
                onChange={e => updateArrayField('education', idx, 'end_date', e.target.value)}
                placeholder="End Date"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {cv.projects.map((proj, idx) => (
            <div key={idx} className="border-l-4 border-purple-200 dark:border-purple-600 pl-4 mb-4">
              <Input
                label="Project Name"
                value={proj.name}
                onChange={e => updateArrayField('projects', idx, 'name', e.target.value)}
                placeholder="Project Name"
                error={errors[`projects.${idx}.name`]}
              />
              <Textarea
                label="Description"
                value={proj.description || ''}
                onChange={e => updateArrayField('projects', idx, 'description', e.target.value)}
                placeholder="Describe the project"
              />
              <Input
                label="Technologies"
                value={proj.technologies.join(', ')}
                onChange={e => updateArrayField('projects', idx, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                placeholder="Comma-separated technologies"
              />
              <Input
                label="Link"
                value={proj.link || ''}
                onChange={e => updateArrayField('projects', idx, 'link', e.target.value)}
                placeholder="Project Link"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          {isSaving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
