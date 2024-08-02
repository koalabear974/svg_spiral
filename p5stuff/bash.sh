source ~/.profile
export PATH=/usr/local/php5/bin:$PATH
alias ns="npm start"
alias nd="npm run dev"
alias nl="npm run lint"
alias vp='f(){ vpype read $1 pagesize a4 linemerge linesort --no-flip linesimplify write $1;  unset -f f; }; f'
alias vplm='f(){ vpype read $1 pagesize a4 linesort --no-flip linesimplify write $1;  unset -f f; }; f'
alias vplmrotate='f(){ vpype read $1 pagerotate pagesize a4 linesort --no-flip linesimplify write $1;  unset -f f; }; f'
alias vplmc='f(){ vpype read --attr stroke $1 pagesize a4 linesort --no-flip linesimplify write $1;  unset -f f; }; f'
alias vplmc3='f(){ vpype read --attr stroke $1 pagesize a3 linesort --no-flip linesimplify write $1;  unset -f f; }; f'
alias vplmc1='f(){ vpype read --attr stroke $1 pagesize a1 linesort --no-flip linesimplify write $1;  unset -f f; }; f'
alias vplmcs3='f(){ vpype read --attr stroke $1 pagesize a3 linesimplify write $1;  unset -f f; 
}; f'
alias vpc3='f(){ vpype read --attr stroke $1 pagesize a3 linemerge linesort --no-flip linesimplify write $1;  unset -f f; }; f'
alias vplmc6='f(){ vpype read --attr stroke $1 pagesize a6 linesort --no-flip linesimplify write $1;  unset -f f; }; f'
alias vpgcode='f(){ /Users/adrienrobert/gitrepo/ART/p5stuff/processGcode.sh $(echo "$(pwd)")/$1 $2 $3;  unset -f f; }; f'
alias vphpgl='f(){ /Users/adrienrobert/gitrepo/ART/p5stuff/processHpgl.sh $(echo "$(pwd)")/$1 $2 $3;  unset -f f; }; f'
alias latestfile='ls -t art_* | head -n 1'
alias latestint='ls -t interact_* | head -n 1'
vpypecrop3() {
  if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
    echo "Usage: vpypecrop3 <filename> <cropX> [cropY]"
    return 1
  fi

  entryFile="$1"
  cropX="$2"
  cropY="${3:-$cropX}"  # If cropY is not provided, set it to cropX
  outputFile="$entryFile"

  cropWidth=$((297 - 2 * cropX))
  cropHeight=$((420 - 2 * cropY))

  vpype read --attr stroke "$entryFile" crop "${cropX}mm" "${cropY}mm" "${cropWidth}mm" "${cropHeight}mm" write "$outputFile"
}
vpypecrop4() {
  if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
    echo "Usage: vpypecrop4 <filename> <cropX> [cropY]"
    return 1
  fi

  entryFile="$1"
  cropX="$2"
  cropY="${3:-$cropX}"  # If cropY is not provided, set it to cropX
  outputFile="$entryFile"

  cropWidth=$((210 - 2 * cropX))
  cropHeight=$((297 - 2 * cropY))

  vpype read --attr stroke "$entryFile" crop "${cropX}mm" "${cropY}mm" "${cropWidth}mm" "${cropHeight}mm" write "$outputFile"
}
vpypecrop6() {
  if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
    echo "Usage: vpypecrop6 <filename> <cropX> [cropY]"
    return 1
  fi

  entryFile="$1"
  cropX="$2"
  cropY="${3:-$cropX}"  # If cropY is not provided, set it to cropX
  outputFile="$entryFile"

  cropWidth=$((105 - cropX - cropX))
  cropHeight=$((148 - cropY - cropY))

  vpype read --attr stroke "$entryFile" crop "${cropX}mm" "${cropY}mm" "${cropWidth}mm" "${cropHeight}mm" write "$outputFile"
}
vpropost() {
  if [ "$#" -lt 1 ]; then
    echo "Usage: vpropost <filename>"
    return 1
  fi

  entryFile="$1"
  echo vplmc6 $1
  vplmc6 $1
  echo vpypecrop6 $1 8
  vpypecrop6 $1 8
  echo vpgcode $1
  vpgcode $1
}

vpropostlatest() {
  vpropost $(ls -t interact_* | head -n 1)
}

vpross3() {
  vplmc3 $(latestfile)
  vpgcode $(latestfile) -c
}



vphide() {
  axicli $1 --hiding --preview --report_time
  axicli $1 -THvg1 -L2 -o $1.new
}


. "/Users/adrienrobert/.new_local/env"
alias reload='source ~/.bash_profile && echo "File .bash_profile reloaded correctly" || echo "Syntax error, could not import the file"';
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
export PATH="$PYENV_ROOT/shims:$PATH"
if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init -)"
fi

CANVAS_SKETCH_OUTPUT=/Users/adrienrobert/gitrepo/ART/p5stuff/exports
