import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

interface ProjectSelectProps {
  label?: string;
  placeholder?: string;
  projects: string[];
  onAddProject?: (newProject: string) => Promise<void>;
  onChange?: (value: string) => void;
  value?: string;
}

export default function ProjectSelect({
  label = "Dimensjon 1 - Prosjekt *",
  placeholder = "Søk eller skriv prosjektnavn",
  projects: initialProjects,
  onAddProject,
  onChange,
  value
}: ProjectSelectProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [inputValue, setInputValue] = useState(value || "");
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const exactMatch = projects.find(p => p.toLowerCase() === inputValue.toLowerCase());
  const isCustom = inputValue.length > 0 && (!exactMatch || inputValue.length > exactMatch.length);

  const matchingProjects = inputValue.length > 0
    ? projects.filter(p => p.toLowerCase().startsWith(inputValue.toLowerCase()))
    : projects;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowDropdown(true);
  };

  const handleSelect = (val: string) => {
    setInputValue(val);
    onChange?.(val);
    setShowDropdown(false);
  };

  const handleAddNew = async () => {
    setSaving(true);

    setTimeout(async () => {
      const newProject = inputValue;

      try {
        if (onAddProject) await onAddProject(newProject);
        setProjects(prev => [...prev, newProject]);
        setInputValue(newProject);
        onChange?.(newProject);
      } finally {
        setSaving(false);
        setShowDropdown(false);
      }
    }, 1000);
  };

  return (
    <div className="w-full space-y-2 relative">
      <label className="block text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          disabled={saving}
          className={`pr-10 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {saving ? (
          <div className="absolute right-2 top-2.5 w-4 h-4 border-2 border-t-transparent border-green-600 rounded-full animate-spin" />
        ) : (
          <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
        )}
      </div>

      {showDropdown && matchingProjects.length > 0 && !saving && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-48 overflow-y-auto">
          {matchingProjects.map((project) => (
            <div
              key={project}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(project)}
            >
              {project}
            </div>
          ))}
        </div>
      )}

      {inputValue && isCustom && !saving && (
        <div
          className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-48 overflow-y-auto px-4 py-2 cursor-pointer hover:bg-gray-100 text-[#009640]"
          onClick={handleAddNew}
        >
          + Legg til "{inputValue}"
        </div>
      )}

      {saving && (
        <div className="absolute z-20 mt-1 w-full flex items-center gap-2 bg-white border border-gray-300 rounded-md shadow-md px-4 py-2 text-[#009640]">
          <div className="w-4 h-4 border-2 border-t-transparent border-green-600 rounded-full animate-spin"></div>
          Lagre ny dimensjon
        </div>
      )}
    </div>
  );
}


{/*
  Usage
  
  <ProjectSelect
      label="Dimensjon 1 - Prosjekt *"
      placeholder="Søk eller skriv prosjektnavn"
      projects={["1000 - Eksempelprosjekt", "10002 - Eksempelprosjekt"]}
      value="1000 - Eksempelprosjekt"
      onChange={(val) => console.log('Selected:', val)}
      onAddProject={async (newProject) => {
        console.log('Adding new:', newProject);
      }}
    /> 

*/}