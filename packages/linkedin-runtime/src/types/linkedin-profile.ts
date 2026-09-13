import { LinkedInExperience } from "./linkedin-experience";
import { LinkedInEducation } from "./linkedin-education";
import { LinkedInContact } from "./linkedin-contact";
import { LinkedInPost } from "./linkedin-post";

export interface LinkedInProfile {
  id: string;
  profileUrl: string;

  name: string;
  headline?: string;
  location?: string;
  about?: string;

  avatar?: string;
  banner?: string;

  followers: number;
  connections: number;

  skills: string[];

  experience: LinkedInExperience[];
  education: LinkedInEducation[];

  contact?: LinkedInContact;

  posts?: LinkedInPost[];
}
