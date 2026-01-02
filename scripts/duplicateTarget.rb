#!/usr/bin/env ruby

require 'rubygems'
require 'xcodeproj'

# Get arguments from command line or prompt user
if ARGV.length == 3
  original_target_name = ARGV[0]
  new_target_name = ARGV[1]
  product_name = ARGV[2]
else
  puts "Target Duplication Script"
  puts "=" * 50
  
  # Ask for original target name
  print "Enter original target name (e.g., NewProject): "
  original_target_name = gets.chomp.strip
  
  if original_target_name.empty?
    puts "ERROR: Original target name cannot be empty"
    exit 1
  end
  
  # Ask for new target name
  print "Enter new target name (e.g., NewProject-Dev): "
  new_target_name = gets.chomp.strip
  
  if new_target_name.empty?
    puts "ERROR: New target name cannot be empty"
    exit 1
  end
  
  # Ask for product name
  print "Enter product name (e.g., NewProject) [default: #{new_target_name}]: "
  product_name = gets.chomp.strip
  product_name = new_target_name if product_name.empty?
  
  puts "=" * 50
end

# Path to Xcode project (check if we're in ios directory or project root)
if File.exist?("#{original_target_name}.xcodeproj")
  project_path = "#{original_target_name}.xcodeproj"
elsif File.exist?("ios/#{original_target_name}.xcodeproj")
  project_path = "ios/#{original_target_name}.xcodeproj"
else
  puts "ERROR: Project not found. Tried:"
  puts "  - #{original_target_name}.xcodeproj"
  puts "  - ios/#{original_target_name}.xcodeproj"
  exit 1
end

puts "Starting target duplication..."
puts "Original target: #{original_target_name}"
puts "New target: #{new_target_name}"
puts "Product name: #{product_name}"

# Load the Xcode project
project = Xcodeproj::Project.open(project_path)

# Find the original target
original_target = project.targets.find { |target| target.name == original_target_name }

if original_target.nil?
  puts "ERROR: Original target '#{original_target_name}' not found in project."
  puts "Available targets: #{project.targets.map(&:name).join(', ')}"
  exit 1
end

# Create new target with same properties as original
new_target = project.new_target(
  original_target.symbol_type,
  new_target_name,
  original_target.platform_name,
  original_target.deployment_target
)

# Set the product name
new_target.product_name = product_name

puts "Created new target: #{new_target_name}"

# Copy build configurations and settings
new_target.build_configurations.each do |new_config|
  original_config = original_target.build_configurations.find { |c| c.name == new_config.name }
  if original_config
    # Copy all build settings from original to new target
    new_config.build_settings.update(original_config.build_settings)
    # Update product name to new product name
    new_config.build_settings["PRODUCT_NAME"] = product_name
  end
end

puts "Copied build configurations"

# Copy all build phases including shell script build phases
original_target.build_phases.each do |src_phase|
  if src_phase.instance_of?(Xcodeproj::Project::Object::PBXShellScriptBuildPhase)
    # Create a new shell script build phase
    dst_phase = project.new(Xcodeproj::Project::Object::PBXShellScriptBuildPhase)
    dst_phase.name = src_phase.name
    dst_phase.shell_script = src_phase.shell_script
    dst_phase.shell_path = src_phase.shell_path
    dst_phase.input_paths = src_phase.input_paths.dup if src_phase.input_paths
    dst_phase.output_paths = src_phase.output_paths.dup if src_phase.output_paths
    dst_phase.input_file_list_paths = src_phase.input_file_list_paths.dup if src_phase.input_file_list_paths
    dst_phase.output_file_list_paths = src_phase.output_file_list_paths.dup if src_phase.output_file_list_paths
    dst_phase.show_env_vars_in_log = src_phase.show_env_vars_in_log if src_phase.respond_to?(:show_env_vars_in_log)
    new_target.build_phases << dst_phase
  else
    phase_class = src_phase.class
    
    # Find or create the corresponding phase in new target
    dst_phase = new_target.build_phases.find { |phase| phase.instance_of?(phase_class) }
    
    unless dst_phase
      dst_phase = project.new(phase_class)
      new_target.build_phases << dst_phase
    end
    
    # Clear existing files in destination phase
    dst_phase.files.each { |file| file.remove_from_project }
    
    # Copy files from source to destination phase
    src_phase.files.each do |src_file|
      build_file = project.new(Xcodeproj::Project::Object::PBXBuildFile)
      build_file.file_ref = src_file.file_ref
      dst_phase.files << build_file
    end
  end
end

puts "Copied all build phases (including shell scripts)"

# Load the original scheme if it exists
original_scheme_path = Xcodeproj::XCScheme.shared_data_dir(project.path) + "#{original_target_name}.xcscheme"
original_scheme = nil

if File.exist?(original_scheme_path)
  original_scheme = Xcodeproj::XCScheme.new(original_scheme_path)
  puts "Found original scheme at #{original_scheme_path}"
end

# Create scheme for new target
new_scheme = Xcodeproj::XCScheme.new
new_scheme.add_build_target(new_target)
new_scheme.set_launch_target(new_target)

# Copy pre-actions and post-actions from original scheme if it exists
if original_scheme
  # Copy launch action pre-actions (most common for React Native)
  if original_scheme.launch_action && original_scheme.launch_action.pre_actions
    original_scheme.launch_action.pre_actions.each do |pre_action|
      new_pre_action = Xcodeproj::XCScheme::ExecutionAction.new(:pre_launch, :shell_script)
      
      if pre_action.action_content
        new_action_content = Xcodeproj::XCScheme::ShellScriptActionContent.new
        new_action_content.title = pre_action.action_content.title
        new_action_content.script_text = pre_action.action_content.script_text
        
        # Create buildable reference for new target
        if pre_action.action_content.buildable_reference
          new_buildable_ref = Xcodeproj::XCScheme::BuildableReference.new(new_target)
          new_buildable_ref.set_reference_target(new_target)
          new_action_content.buildable_reference = new_buildable_ref
        end
        
        new_pre_action.action_content = new_action_content
      end
      
      new_scheme.launch_action.add_pre_action(new_pre_action)
    end
    puts "Copied launch action pre-actions"
  end
end

new_scheme.save_as(project.path, new_target_name, true)

puts "Created scheme: #{new_target_name}"

# Save the project
project.save

puts "\n✓ Successfully duplicated target!"
puts "Target '#{new_target_name}' created as a copy of '#{original_target_name}'"
puts "\nNext steps:"
puts "1. Open #{original_target_name}.xcodeproj in Xcode"
puts "2. Review the new target configuration"
puts "3. Update bundle identifier if needed"
puts "4. Build and test the new target"
