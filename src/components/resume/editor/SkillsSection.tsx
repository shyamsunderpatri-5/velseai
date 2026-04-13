"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useResumeStore } from "@/stores/resumeStore";
import { Plus, Trash2, X, Sparkles } from "lucide-react";

const SKILL_CATEGORIES = [
  "Programming Languages",
  "Frameworks & Libraries",
  "Tools & Technologies",
  "Databases",
  "Cloud & DevOps",
  "Soft Skills",
  "Other",
];

export function SkillsSection() {
  const { content, addSkill, updateSkill, removeSkill } = useResumeStore();
  const { skills } = content;

  const addSkillToCategory = (skillId: string, skill: string) => {
    const skillObj = skills.find((s) => s.id === skillId);
    if (skillObj && skill.trim()) {
      const newSkills = [...skillObj.skills, skill.trim()];
      updateSkill(skillId, { skills: newSkills });
    }
  };

  const removeSkillFromCategory = (skillId: string, skillToRemove: string) => {
    const skillObj = skills.find((s) => s.id === skillId);
    if (skillObj) {
      const newSkills = skillObj.skills.filter((s) => s !== skillToRemove);
      updateSkill(skillId, { skills: newSkills });
    }
  };

  const updateCategoryName = (skillId: string, name: string) => {
    updateSkill(skillId, { category: name });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-1">Skills</h2>
          <p className="text-sm text-muted-foreground">
            Add your technical and soft skills
          </p>
        </div>
        <Button size="sm" onClick={addSkill}>
          <Plus className="w-4 h-4 mr-1" />
          Add Category
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No skills added yet
            </p>
            <Button onClick={addSkill}>
              <Plus className="w-4 h-4 mr-2" />
              Add Skills
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {skills.map((skillObj) => (
            <Card key={skillObj.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={skillObj.category}
                    onChange={(e) =>
                      updateCategoryName(skillObj.id, e.target.value)
                    }
                    className="font-medium max-w-[200px]"
                    placeholder="Category name"
                  />
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Suggest
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeSkill(skillObj.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {skillObj.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        onClick={() =>
                          removeSkillFromCategory(skillObj.id, skill)
                        }
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <SkillInput
                  onAdd={(skill) => addSkillToCategory(skillObj.id, skill)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillInput({ onAdd }: { onAdd: (skill: string) => void }) {
  const [value, setValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onAdd(value);
      setValue("");
    }
  };

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type a skill and press Enter"
      className="max-w-md"
    />
  );
}
