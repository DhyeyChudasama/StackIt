import React from 'react';
import { 
  Code, 
  Database, 
  Globe, 
  Smartphone, 
  Server, 
  Cpu, 
  Palette, 
  Shield, 
  Cloud, 
  Zap,
  Monitor,
  Layers,
  GitBranch,
  Package,
  Terminal,
  Wrench,
  BookOpen,
  Tag
} from 'lucide-react';

interface TagIconProps {
  tag: string;
  className?: string;
}

const TagIcon: React.FC<TagIconProps> = ({ tag, className = "w-4 h-4" }) => {
  const getTagIcon = (tagName: string) => {
    const lowerTag = tagName.toLowerCase();
    
    // Programming Languages
    if (lowerTag.includes('javascript') || lowerTag.includes('js')) return <Code className={className} />;
    if (lowerTag.includes('typescript') || lowerTag.includes('ts')) return <Code className={className} />;
    if (lowerTag.includes('python')) return <Code className={className} />;
    if (lowerTag.includes('java')) return <Code className={className} />;
    if (lowerTag.includes('react')) return <Zap className={className} />;
    if (lowerTag.includes('vue')) return <Layers className={className} />;
    if (lowerTag.includes('angular')) return <Shield className={className} />;
    if (lowerTag.includes('node')) return <Server className={className} />;
    
    // Web Technologies
    if (lowerTag.includes('html')) return <Globe className={className} />;
    if (lowerTag.includes('css')) return <Palette className={className} />;
    if (lowerTag.includes('tailwind')) return <Palette className={className} />;
    if (lowerTag.includes('bootstrap')) return <Palette className={className} />;
    
    // Mobile
    if (lowerTag.includes('android') || lowerTag.includes('ios') || lowerTag.includes('mobile')) return <Smartphone className={className} />;
    if (lowerTag.includes('flutter') || lowerTag.includes('react-native')) return <Smartphone className={className} />;
    
    // Backend & Database
    if (lowerTag.includes('database') || lowerTag.includes('sql') || lowerTag.includes('mongodb')) return <Database className={className} />;
    if (lowerTag.includes('api') || lowerTag.includes('rest') || lowerTag.includes('graphql')) return <Server className={className} />;
    
    // DevOps & Tools
    if (lowerTag.includes('docker') || lowerTag.includes('kubernetes')) return <Package className={className} />;
    if (lowerTag.includes('git') || lowerTag.includes('github')) return <GitBranch className={className} />;
    if (lowerTag.includes('aws') || lowerTag.includes('cloud') || lowerTag.includes('azure')) return <Cloud className={className} />;
    if (lowerTag.includes('linux') || lowerTag.includes('terminal') || lowerTag.includes('bash')) return <Terminal className={className} />;
    
    // General
    if (lowerTag.includes('algorithm') || lowerTag.includes('data-structure')) return <Cpu className={className} />;
    if (lowerTag.includes('security')) return <Shield className={className} />;
    if (lowerTag.includes('performance')) return <Zap className={className} />;
    if (lowerTag.includes('testing')) return <Wrench className={className} />;
    if (lowerTag.includes('tutorial') || lowerTag.includes('learning')) return <BookOpen className={className} />;
    if (lowerTag.includes('ui') || lowerTag.includes('ux') || lowerTag.includes('design')) return <Monitor className={className} />;
    
    // Default
    return <Tag className={className} />;
  };

  return getTagIcon(tag);
};

export default TagIcon;