"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useResumeStore } from "@/stores/resumeStore";
import { Plus, Trash2 } from "lucide-react";

export function EducationSection() {
  const { content, addEducation, updateEducation, removeEducation } =
    useResumeStore();
  const { education } = content;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-1">Education</h2>
          <p className="text-sm text-muted-foreground">
            Add your educational qualifications
          </p>
        </div>
        <Button size="sm" onClick={addEducation}>
          <Plus className="w-4 h-4 mr-1" />
          Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No education added yet
            </p>
            <Button onClick={addEducation}>
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {education.map((edu, index) => (
            <Card key={edu.id}>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">
                    Education {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeEducation(edu.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, { institution: e.target.value })
                      }
                      placeholder="Indian Institute of Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, { degree: e.target.value })
                      }
                      placeholder="Bachelor of Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) =>
                        updateEducation(edu.id, { field: e.target.value })
                      }
                      placeholder="Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={edu.location || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, { location: e.target.value })
                      }
                      placeholder="Mumbai, India"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade / GPA</Label>
                    <Input
                      value={edu.gpa || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, { gpa: e.target.value })
                      }
                      placeholder="8.5 CGPA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Year</Label>
                    <Input
                      type="month"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(edu.id, { startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Year</Label>
                    <Input
                      type="month"
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducation(edu.id, { endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
