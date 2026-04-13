"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/stores/resumeStore";
import { Plus, Trash2, X, Link as LinkIcon } from "lucide-react";

export function ProjectsSection() {
  const { content, addProject, updateProject, removeProject } = useResumeStore();
  const { projects } = content;

  const addTechnology = (projectId: string, tech: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project && tech.trim()) {
      updateProject(projectId, {
        technologies: [...project.technologies, tech.trim()],
      });
    }
  };

  const removeTechnology = (projectId: string, tech: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      updateProject(projectId, {
        technologies: project.technologies.filter((t) => t !== tech),
      });
    }
  };

  const addBulletPoint = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      updateProject(projectId, {
        bulletPoints: [...project.bulletPoints, ""],
      });
    }
  };

  const updateBulletPoint = (projectId: string, index: number, value: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      const newBullets = [...project.bulletPoints];
      newBullets[index] = value;
      updateProject(projectId, { bulletPoints: newBullets });
    }
  };

  const removeBulletPoint = (projectId: string, index: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (project && project.bulletPoints.length > 1) {
      updateProject(projectId, {
        bulletPoints: project.bulletPoints.filter((_, i) => i !== index),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-1">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Showcase your notable projects
          </p>
        </div>
        <Button size="sm" onClick={addProject}>
          <Plus className="w-4 h-4 mr-1" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No projects added yet
            </p>
            <Button onClick={addProject}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project, index) => (
            <Card key={project.id}>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">
                    Project {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeProject(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input
                      value={project.name}
                      onChange={(e) =>
                        updateProject(project.id, { name: e.target.value })
                      }
                      placeholder="E-commerce Platform"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Technologies Used</Label>
                    <TechnologyInput
                      technologies={project.technologies}
                      onAdd={(tech) => addTechnology(project.id, tech)}
                      onRemove={(tech) => removeTechnology(project.id, tech)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Live URL</Label>
                    <Input
                      type="url"
                      value={project.liveUrl || ""}
                      onChange={(e) =>
                        updateProject(project.id, { liveUrl: e.target.value })
                      }
                      placeholder="https://project.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GitHub URL</Label>
                    <Input
                      type="url"
                      value={project.githubUrl || ""}
                      onChange={(e) =>
                        updateProject(project.id, { githubUrl: e.target.value })
                      }
                      placeholder="https://github.com/you/project"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) =>
                      updateProject(project.id, { description: e.target.value })
                    }
                    placeholder="Brief description of the project..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Key Achievements</Label>
                  {project.bulletPoints.map((bullet, bulletIndex) => (
                    <div key={bulletIndex} className="flex gap-2">
                      <span className="text-muted-foreground mt-2">•</span>
                      <Input
                        value={bullet}
                        onChange={(e) =>
                          updateBulletPoint(project.id, bulletIndex, e.target.value)
                        }
                        placeholder="Achievement or feature..."
                      />
                      {project.bulletPoints.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() =>
                            removeBulletPoint(project.id, bulletIndex)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-5"
                    onClick={() => addBulletPoint(project.id)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Point
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TechnologyInput({
  technologies,
  onAdd,
  onRemove,
}: {
  technologies: string[];
  onAdd: (tech: string) => void;
  onRemove: (tech: string) => void;
}) {
  const [value, setValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      onAdd(value);
      setValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech) => (
          <Badge key={tech} variant="secondary" className="gap-1">
            {tech}
            <button
              onClick={() => onRemove(tech)}
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="React, Node.js, PostgreSQL..."
      />
    </div>
  );
}
